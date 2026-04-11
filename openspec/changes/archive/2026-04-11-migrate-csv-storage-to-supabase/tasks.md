## 1. Supabase 專案與 Schema 準備

- [x] 1.1 在 Supabase 建立新專案，取得 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`
- [x] 1.2 新增 `supabase/migrations/0001_init.sql`，包含 `participants` 與 `event_settings` 表建立、主鍵、`id = 1` check constraint、`uploaded_at`/`updated_at` 預設值
- [x] 1.3 在 SQL 中對兩張表啟用 RLS（`alter table ... enable row level security;`），不建立任何 policy
- [x] 1.4 在 Supabase SQL editor 執行 migration，確認兩張表建立成功

## 2. 環境變數與相依套件

- [x] 2.1 `npm install @supabase/supabase-js`
- [x] 2.2 `npm uninstall @vercel/blob`
- [x] 2.3 更新 `.env.example`：新增 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`；移除 `BLOB_READ_WRITE_TOKEN`
- [x] 2.4 在 `.env.local` 設定新變數以利本機開發
- [x] 2.5 在 Vercel dashboard 的 Preview 與 Production 環境設定新變數

## 3. Supabase Client 共用模組

- [x] 3.1 建立 `src/lib/supabase.ts`，使用 `createClient` 並以 service role key 初始化 singleton
- [x] 3.2 在模組載入時驗證必要環境變數存在，否則 throw 明確錯誤
- [x] 3.3 設定 `auth.persistSession = false`、`auth.autoRefreshToken = false`

## 4. 參與者資料 Loader 遷移

- [x] 4.1 重寫 `src/lib/csvLoader.ts`，移除 `@vercel/blob`、`csv-parse`、`next/cache noStore` 的 import
- [x] 4.2 實作 `getTicketNumber(email)`：正規化後以 Supabase primary key 查詢，回傳 `ticket_number` 或 `null`
- [x] 4.3 實作 `getParticipantCount()`：以 Supabase `select('*', { count: 'exact', head: true })` 回傳列數
- [x] 4.4 實作 `hasParticipantsFile()`：透過 `getParticipantCount` 或 `head + limit(1)` 判斷是否有任何列
- [x] 4.5 保留既有函數名稱與簽名以避免呼叫端改動

## 5. CSV 上傳端點遷移

- [x] 5.1 修改 `app/api/admin/upload-csv/route.ts`，移除 `put` 寫入 Blob 的邏輯
- [x] 5.2 保留 admin 權限驗證與 multipart 解析
- [x] 5.3 以 `csv-parse` 在伺服器端解析 CSV，提取 email（index 4）、ticket_number（index 1），正規化 email 並去除重複
- [x] 5.4 先執行 `supabase.from('participants').delete().neq('email', '')` 清空舊資料
- [x] 5.5 以 `supabase.from('participants').insert(rows)` 批次寫入新資料
- [x] 5.6 錯誤時回傳 500 並記錄詳細訊息；成功時回傳寫入列數

## 6. 活動設定遷移

- [x] 6.1 重寫 `src/lib/eventSettings.ts`，移除所有 `@vercel/blob` 呼叫
- [x] 6.2 實作 `saveEventSettings(eventId, eventName?)` 以 `.upsert({ id: 1, ... })` 寫入 `event_settings`
- [x] 6.3 實作 `getEventId()`：先查 Supabase，若無則 fallback 至 `process.env.EVENT_ID`
- [x] 6.4 實作 `getEventName()`：先查 Supabase，若無則回傳預設值「活動報到」
- [x] 6.5 實作 `getEventSettingsWithSource()`：回傳 `eventIdSource = 'supabase' | 'env' | null`、`eventNameSource = 'supabase' | 'default'`
- [x] 6.6 更新匯入 `eventSettings.ts` 的元件（如 `app/admin/EventSettingsForm.tsx`），確認 source 字串顯示正確

## 7. 清理 Vercel Blob 殘留

- [x] 7.1 搜尋整個 repo，確認不再有 `@vercel/blob` import 與 `BLOB_READ_WRITE_TOKEN` 使用
- [x] 7.2 移除 `app/admin/SampleCsvDownload.tsx`（若其中有 Blob 依賴）中任何 Blob 相關程式碼
- [x] 7.3 執行 `npm run build` 或 `tsc --noEmit` 確認無型別錯誤

## 8. 本機驗證

- [x] 8.1 啟動 `npm run dev`，進入 `/admin` 頁面確認可讀取空的設定狀態
- [x] 8.2 透過 admin 頁面上傳測試 CSV，確認成功訊息與 Supabase `participants` 表內容
- [x] 8.3 在 check-in 頁面測試已註冊與未註冊 email 的查詢結果
- [ ] 8.4 測試混合大小寫 email 查詢
- [x] 8.5 透過 admin 頁面更新 event_id 與 event_name，重新整理後確認 source 顯示為 `supabase`
- [x] 8.6 清空 Supabase `event_settings` 表後驗證 fallback 至環境變數與預設值的行為

## 9. 部署與資料遷移

- [x] 9.1 在 feature branch 建立 PR，執行 CI
- [x] 9.2 合併後確認 Vercel 部署成功、環境變數就緒
- [x] 9.3 透過 production admin 頁面重新上傳最新的 participants CSV
- [x] 9.4 透過 production admin 頁面重新填寫 event_id 與 event_name
- [x] 9.5 進行一次完整 check-in 流程的 smoke test

## 10. 收尾

- [x] 10.1 穩定運作 24 小時後，從 Vercel 環境變數移除 `BLOB_READ_WRITE_TOKEN`
- [ ] 10.2 （可選）刪除 Vercel Blob store
- [ ] 10.3 執行 `openspec archive migrate-csv-storage-to-supabase` 歸檔本次變更
