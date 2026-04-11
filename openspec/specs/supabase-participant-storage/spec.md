## Requirements

### Requirement: 系統必須使用 Supabase Postgres 儲存參與者資料
系統 SHALL 在 Supabase Postgres 建立 `participants` 表，以 `email`（小寫正規化）為主鍵，`ticket_number` 為必填欄位，取代以 Vercel Blob 儲存 CSV 檔案的做法。

#### Scenario: 建立 participants 表
- **WHEN** 系統初始化 Supabase 資料庫 schema
- **THEN** 系統建立含有 `email text primary key`、`ticket_number text not null`、`uploaded_at timestamptz default now()` 欄位的 `participants` 表

#### Scenario: 啟用 Row Level Security
- **WHEN** 建立 `participants` 表
- **THEN** 系統對該表啟用 RLS，且不建立任何 policy，僅允許 service role key 繞過存取

### Requirement: 系統必須使用 service role key 連線 Supabase
系統 SHALL 透過 `@supabase/supabase-js` 以 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY` 環境變數建立伺服器端 client，且僅在伺服器端程式碼中使用。

#### Scenario: 建立 Supabase client
- **WHEN** 伺服器程式碼需要存取 Supabase
- **THEN** 系統從 `src/lib/supabase.ts` 匯入唯一的 singleton client，該 client 以 service role key 建立且 `auth.persistSession = false`

#### Scenario: 缺少環境變數
- **WHEN** `SUPABASE_URL` 或 `SUPABASE_SERVICE_ROLE_KEY` 其中之一未設定
- **THEN** `src/lib/supabase.ts` 於模組載入時拋出明確錯誤

#### Scenario: 禁止在 client component 匯入
- **WHEN** 程式碼審查發現 client component 匯入 `src/lib/supabase.ts`
- **THEN** 該改動必須被拒絕，因為 service role key 不可暴露到瀏覽器端

### Requirement: 系統必須提供 email 查詢票號 API
系統 SHALL 提供伺服器端函數 `getTicketNumber(email)`，以不區分大小寫的方式查詢 `participants.email` 並回傳對應的 `ticket_number`。

#### Scenario: 成功查詢票號
- **WHEN** 使用已存在的 email（任意大小寫）呼叫 `getTicketNumber`
- **THEN** 系統將 email 轉為小寫後查詢 Supabase，回傳 `ticket_number` 字串

#### Scenario: 查無此人
- **WHEN** 使用不存在於 `participants` 表的 email 呼叫 `getTicketNumber`
- **THEN** 系統回傳 `null`

#### Scenario: Supabase 連線失敗
- **WHEN** 查詢 Supabase 時發生網路或權限錯誤
- **THEN** 系統記錄錯誤並回傳 `null`，呼叫端顯示「找不到參與者」訊息，不應使整個請求崩潰

### Requirement: 系統必須提供參與者計數與存在性 API
系統 SHALL 提供 `getParticipantCount()` 與 `hasParticipantsFile()` 函數，兩者皆以 Supabase 為資料來源。

#### Scenario: 計算參與者數量
- **WHEN** 呼叫 `getParticipantCount`
- **THEN** 系統透過 Supabase `select count` 回傳 `participants` 表的總列數

#### Scenario: 檢查是否已有參與者資料
- **WHEN** 呼叫 `hasParticipantsFile`
- **THEN** 系統回傳 `participants` 表是否至少存在一列（布林值）
