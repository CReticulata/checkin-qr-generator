## Context

本專案為 WebCamp 活動報到系統。目前參與者資料與活動設定都儲存在 Vercel Blob：

- `participants-{timestamp}.csv`：管理員上傳的 CSV，含 email 與票號
- `settings.json`：活動 ID 與名稱

熱路徑 `csvLoader.ts` 在每次 check-in 時：
1. 呼叫 `@vercel/blob` 的 `list()`（1 Advanced Operation）
2. `fetch()` 下載 CSV（1 Advanced Operation）
3. `csv-parse` 解析、建 Map

`eventSettings.ts` 同樣會 `list()` + `fetch()` `settings.json`，每次管理員頁面載入或需要 event name 時都會觸發。Vercel Blob 免費額度 2,000 Operations 已使用 75%，活動接近尾聲或規模擴大時必定超額。

專案使用 Next.js 15 App Router、server components 與 route handlers，Vercel 部署。目前無外部資料庫，Supabase 為 Vercel 生態外最普遍、免費額度最寬裕的 Postgres 服務，且 `@supabase/supabase-js` 是純 JS SDK、可直接在 Vercel Edge/Node runtime 使用。

## Goals / Non-Goals

**Goals:**
- 完全消除 Vercel Blob 對 check-in 熱路徑與 admin 熱路徑的依賴
- email → ticket 查詢維持 O(1)（資料庫索引取代記憶體 Map）
- 保留現有 admin CSV 上傳 UX，管理員無感
- 維持 event_id 的「儲存 → env」優先序 fallback 行為
- 完全移除 `@vercel/blob` 相依套件

**Non-Goals:**
- 不引入 ORM（Prisma、Drizzle 等）；直接使用 `@supabase/supabase-js`
- 不實作跨活動多租戶；`event_settings` 為單列表
- 不改變 `csvLoader.ts` 對外匯出 API 簽名（`getTicketNumber`、`getParticipantCount`、`hasParticipantsFile`）
- 不改變 admin UI 元件
- 不實作 client-side Supabase 使用；所有查詢皆在伺服器端以 service role key 執行

## Decisions

### 決策 1：選擇 Supabase Postgres 作為後端

**選項：**
- (A) 加入記憶體快取 TTL，續用 Vercel Blob
- (B) Vercel KV（Upstash Redis）
- (C) Supabase Postgres  ← 選擇
- (D) Neon / Turso / PlanetScale 等其他無伺服器 Postgres

**選擇 Supabase 的理由：**
- 免費額度寬裕：500MB 資料庫、5GB 頻寬、每月 50,000 MAU，對活動報到規模（數千人）綽綽有餘
- SQL 可做更複雜的查詢（之後若要做統計、報表容易擴展）
- `@supabase/supabase-js` 輕量，Vercel 部署無須額外設定
- 使用者點名要求 Supabase（見 proposal）

**為何不選 (A)**：記憶體快取在 serverless 環境下每個 cold start 都要重建，且 Vercel 會在 build-time/request-time 之間換 container，快取命中率低，治標不治本。

**為何不選 (B)**：KV 雖然簡單但只能存 key-value，失去未來做 SQL 查詢/報表的彈性。

### 決策 2：資料表結構

```sql
-- participants 表
create table participants (
  email text primary key,          -- 已 lower() 正規化
  ticket_number text not null,
  uploaded_at timestamptz not null default now()
);

-- event_settings 單列表
create table event_settings (
  id int primary key default 1 check (id = 1),  -- 強制只能有一列
  event_id text,
  event_name text,
  updated_at timestamptz not null default now()
);
```

- `participants.email` 作 PK，天然支援 upsert 與 O(1) 查詢；插入前在 server 端 `.toLowerCase().trim()`
- `event_settings` 使用 singleton 模式（`id = 1` check constraint），`upsert` 時指定 `id: 1`
- 兩張表皆開啟 RLS 並不建立任何 policy；伺服器透過 service role key 繞過 RLS

### 決策 3：CSV 上傳的寫入策略

**選項：**
- (A) 清空整張表後 bulk insert
- (B) Upsert（保留歷史）
- (C) 交易內 delete + insert

**選擇 (C)**：在單一 Supabase RPC 或連續呼叫中 `delete from participants` → `insert` 新批次。這樣可以確保「新 CSV 完全取代舊 CSV」的語意（和目前 Blob 版本「上傳新檔名 + 刪除舊檔」一致），避免舊參與者殘留。

Supabase JS client 不支援多語句交易，因此採用：
1. `supabase.from('participants').delete().neq('email', '')`（刪除全部）
2. `supabase.from('participants').insert(rows)`（批次插入，`@supabase/supabase-js` 支援單次呼叫插入多列）

若第 2 步失敗則回傳 500，由管理員重新上傳；資料表可能暫時為空，但系統會優雅地回傳「找不到參與者」錯誤，不會崩潰。

### 決策 4：Supabase client 初始化

建立 `src/lib/supabase.ts`：

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

- 模組層 singleton，避免每次請求重建 client
- 使用 service role key 而非 anon key：所有存取都在伺服器，且需要繞過 RLS
- `persistSession: false` 避免在 serverless 環境中嘗試讀寫 local storage

### 決策 5：保留 `csvLoader.ts` 檔名與 API

雖然實作不再解析 CSV，保留檔名可以減少呼叫端改動（`app/check-in`、`app/admin` 等多處都 import 它）。函數名稱 `getTicketNumber`、`getParticipantCount`、`hasParticipantsFile` 全部保留。`hasParticipantsFile` 語意改為「Supabase 表是否有資料」。

## Risks / Trade-offs

- **[風險] Supabase 專案 cold start 延遲**：免費方案在閒置後可能有 ~1s 的 cold start。→ **緩解**：活動當天流量持續，不會閒置；若擔心可在 check-in 頁面掛一個 warmup ping。
- **[風險] 遺漏環境變數導致部署失敗**：Supabase env vars 未在 Vercel 設定會在 runtime 才壞掉。→ **緩解**：`supabase.ts` 初始化時檢查並 throw 明確錯誤；README 與 `.env.example` 同步更新。
- **[風險] 舊 Blob 資料未遷移造成 check-in 失敗**：切換後若沒匯入參與者，所有 check-in 都會失敗。→ **緩解**：上線前先透過 admin 頁面重新上傳最新的 participants CSV；切換步驟寫在 tasks.md 部署章節。
- **[風險] delete-then-insert 非交易**：極端情況下刪除成功但插入失敗會導致資料暫時為空。→ **緩解**：回傳明確錯誤訊息要求管理員重傳；check-in 回傳「找不到參與者」不會崩潰。
- **[Trade-off] service role key 外洩風險**：必須確保永遠不在 client component 匯入 `src/lib/supabase.ts`。→ **緩解**：該檔案只在 server routes 與 server components 匯入；審查 PR 時檢查。
- **[Trade-off] 新增外部服務依賴**：多一個 SaaS 需要維護。→ 接受；Supabase 穩定度足夠，且免費額度已涵蓋預期用量。

## Migration Plan

1. **準備階段**（不影響 production）
   - 建立 Supabase 專案、執行建表 SQL（放在 `supabase/migrations/0001_init.sql`）
   - 將 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY` 加入 Vercel 環境變數（preview + production）
   - 在本機 `.env.local` 設定並跑 dev 測試
2. **程式碼實作**（feature branch）
   - 依 tasks.md 順序實作並通過 type check
3. **部署前資料遷移**
   - 從 Vercel Blob 下載最新 `participants-*.csv`，以 admin 頁面重新上傳（此時 admin 上傳端點已寫入 Supabase）—— 或由維護者直接 SQL 匯入
   - 同步透過 admin 頁面重新設定 event_id 與 event_name
4. **發布**
   - Merge 後 Vercel 自動部署；上線後立刻測試一次 check-in 流程與 admin 頁面
5. **清理**
   - 確認穩定運作 24 小時後，從 Vercel 移除 `BLOB_READ_WRITE_TOKEN`
   - 刪除 Vercel Blob store（可選，節省未來任何殘留計費）

**Rollback**：若上線後發現問題，revert merge commit 並重新部署即可。由於 Blob 資料未刪除，舊版本能立即恢復運作。

## Open Questions

- 是否需要在 `participants` 表額外加上 `created_at` 欄位作為上傳批次區分？目前決定不加，因為「最新上傳 = 唯一有效」的語意已經涵蓋需求。
- 是否要把歷次上傳都保留（改為 append-only + `batch_id`）以便稽核？此版本不實作，留作未來 enhancement。
