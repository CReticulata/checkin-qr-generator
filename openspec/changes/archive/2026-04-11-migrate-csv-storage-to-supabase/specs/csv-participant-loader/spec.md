## MODIFIED Requirements

### Requirement: System must query Supabase for participant data
系統 SHALL 從 Supabase `participants` 表查詢參與者資料，取代從 Vercel Blob Storage 讀取 CSV 檔案的做法。

#### Scenario: Query Supabase on lookup
- **WHEN** 系統需要查詢參與者資料
- **THEN** 系統透過 `@supabase/supabase-js` client 查詢 `participants` 表

#### Scenario: Email lookup via indexed primary key
- **WHEN** 以 email 查詢
- **THEN** 系統使用 `.select('ticket_number').eq('email', <lowercased>).maybeSingle()` 取得票號

#### Scenario: No participants in table
- **WHEN** `participants` 表為空
- **THEN** 查詢函數回傳 `null` 或空結果，呼叫端顯示「找不到參與者」訊息，不應使請求崩潰

### Requirement: System must provide O(1) lookup function
系統 SHALL 提供函數以 O(1) 時間複雜度透過 email 查詢票號，由 Supabase 主鍵索引保證查詢效能。

#### Scenario: Successful email lookup
- **WHEN** 使用已註冊的 email 呼叫 `getTicketNumber`
- **THEN** 系統透過 Supabase 以 primary key 查詢並回傳對應的 `ticket_number`

#### Scenario: Failed email lookup
- **WHEN** 使用未註冊的 email 呼叫 `getTicketNumber`
- **THEN** 系統回傳 `null`

#### Scenario: Case-insensitive lookup
- **WHEN** 使用混合大小寫的 email（例如 `User@Example.com`）進行查詢
- **THEN** 系統於查詢前將 email 轉為小寫並 trim，再以正規化後的字串查詢 Supabase

### Requirement: Writes must normalize email to lowercase
系統 SHALL 在寫入 `participants` 表前將 email 轉為小寫並 trim，以確保查詢時的 case-insensitive 行為。

#### Scenario: Normalization on insert
- **WHEN** 管理員上傳 CSV 並觸發批次 insert
- **THEN** 系統對每一列的 email 呼叫 `.trim().toLowerCase()` 後再寫入

#### Scenario: Duplicate email handling
- **WHEN** CSV 包含重複的 email 地址
- **THEN** 系統使用第一次出現的記錄並記錄警告，避免 primary key 衝突

## REMOVED Requirements

### Requirement: System must parse CSV file with correct column mapping
**Reason**: 熱路徑查詢不再需要解析 CSV；CSV 解析僅在 admin 上傳時於伺服器端發生，並已合併至 `blob-csv-upload` capability 的新要求中。
**Migration**: 呼叫端無需改動；`getTicketNumber` 的函數簽名不變。

### Requirement: System must build email-to-ticket lookup map
**Reason**: 不再在記憶體中建立 Map；改由 Supabase primary key 索引直接提供 O(1) 查詢。
**Migration**: `getTicketNumber(email)` API 保留，效能特性不變。

### Requirement: Upload CSV with timestamped filename
**Reason**: 不再使用 Blob 檔案儲存，因此不需要 timestamped filename。
**Migration**: 改以「清空 `participants` 表後批次 insert」取代「刪除舊檔 + 上傳新檔名」的語意。
