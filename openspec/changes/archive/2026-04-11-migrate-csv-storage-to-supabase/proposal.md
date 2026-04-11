## Why

Vercel Blob 免費額度（2,000 Advanced Operations）即將耗盡，目前已用 75%。每次 check-in 都呼叫 `list()` + `fetch()` 至少 2 個 operations，活動設定讀取也同樣消耗，且 `noStore()` 禁用快取，規模稍大就會超出免費額度並產生費用。改用 Supabase Postgres 將參與者資料與活動設定直接存成表格，可獲得 500MB 資料庫與足夠的免費讀寫額度，同時獲得 O(1) 索引查詢、不用解析 CSV，也不再受 Blob ops 計費限制；並可一次性完全移除 `@vercel/blob` 依賴。

## What Changes

- 新增 Supabase Postgres 作為權威儲存後端，建立兩張表：
  - `participants`（`email` PK、`ticket_number`、`uploaded_at`）
  - `event_settings`（單列設定表，欄位 `event_id`、`event_name`、`updated_at`）
- 管理員上傳 CSV 時改為在伺服器端解析 CSV 後以 `upsert` 寫入 Supabase `participants` 表（取代寫入 Blob），並在上傳前清空或覆寫舊資料
- `csvLoader.ts` 改為透過 Supabase client 以 email 索引查詢票號，移除 `@vercel/blob` 的 `list()` + `fetch()` 路徑
- `eventSettings.ts` 改為讀寫 Supabase `event_settings` 表，保留「Supabase → env 變數」的 fallback 優先序
- 管理員頁面「是否已有參與者資料」的判斷改為查詢 Supabase 參與者列數
- **BREAKING**: 完全移除 Vercel Blob 依賴；`BLOB_READ_WRITE_TOKEN` 不再需要
- 新增環境變數 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`（伺服器端 admin 與 check-in 讀取皆使用 service role）
- 新增 `@supabase/supabase-js` 相依套件，移除 `@vercel/blob`

## Capabilities

### New Capabilities
- `supabase-participant-storage`: 使用 Supabase Postgres 儲存與查詢參與者（email → ticket number）資料，取代 Vercel Blob CSV 檔案儲存
- `supabase-event-settings-storage`: 使用 Supabase Postgres 儲存活動設定（event_id、event_name），取代 Vercel Blob `settings.json`

### Modified Capabilities
- `blob-csv-upload`: 上傳端點不再寫入 Vercel Blob，改為解析 CSV 後寫入 Supabase `participants` 表；API 路徑 `POST /api/admin/upload-csv` 不變
- `csv-participant-loader`: 查詢邏輯從 Vercel Blob `list()` + CSV parse 改為 Supabase SQL 查詢，移除所有 CSV 檔案相關要求
- `admin-event-settings`: 設定持久化從 Vercel Blob `settings.json` 改為 Supabase `event_settings` 表格；「Blob → env」fallback 優先序改為「Supabase → env」

## Impact

- **程式碼**：
  - `src/lib/csvLoader.ts`：改為 Supabase client 查詢
  - `src/lib/eventSettings.ts`：改為 Supabase client 讀寫
  - `app/api/admin/upload-csv/route.ts`：改為解析 CSV 並 upsert 到 Supabase
  - 新增 `src/lib/supabase.ts`：集中管理 Supabase server client 建立（使用 service role key）
- **相依套件**：新增 `@supabase/supabase-js`，移除 `@vercel/blob`
- **環境變數**：新增 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`；移除 `BLOB_READ_WRITE_TOKEN`；更新 `.env.example`、Vercel 環境設定、部署文件
- **資料遷移**：需要將現有 Blob 上最新的 `participants-*.csv` 與 `settings.json` 一次性匯入 Supabase（或請管理員在上線後重新上傳 CSV 並重新填寫設定）
- **基礎設施**：需在 Supabase 建立專案、執行建表 SQL、設定 RLS（所有表格開啟 RLS 並拒絕匿名存取，伺服器使用 service role key 繞過）
- **歸檔**：`blob-csv-upload` spec 完全被取代，於 `/opsx:archive` 時整個 capability 將被移除
