## MODIFIED Requirements

### Requirement: 活動設定持久化於 Supabase
系統 SHALL 將活動設定（eventId、eventName）儲存於 Supabase Postgres 的 `event_settings` 單列表中，取代先前儲存於 Vercel Blob `settings.json` 的做法。

#### Scenario: 儲存設定
- **WHEN** 管理員更新活動設定
- **THEN** 系統對 Supabase `event_settings` 表執行 `upsert({ id: 1, event_id, event_name, updated_at: now() })`

#### Scenario: 讀取設定
- **WHEN** 系統需要讀取活動設定
- **THEN** 系統從 Supabase `event_settings` 表查詢唯一一列，取得 `event_id` 與 `event_name`

#### Scenario: 表格為空時 fallback
- **WHEN** `event_settings` 表為空
- **THEN** `getEventId` 會 fallback 至 `process.env.EVENT_ID`，`getEventName` 會 fallback 至預設值「活動報到」

### Requirement: 管理員可在介面設定活動資訊
系統 SHALL 提供管理員介面讓已授權的管理員設定活動識別碼（EVENT_ID）與活動名稱（eventName）。設定來源顯示改為 `Supabase` 或環境變數/預設值。

#### Scenario: 顯示目前活動設定
- **WHEN** 管理員進入 /admin 頁面
- **THEN** 系統顯示目前的 EVENT_ID 與活動名稱設定值及其來源（Supabase、環境變數或預設值）

#### Scenario: 設定新的 EVENT_ID
- **WHEN** 管理員在設定表單輸入新的 EVENT_ID 並送出
- **THEN** 系統將設定 upsert 至 Supabase `event_settings` 表並顯示成功訊息

#### Scenario: 設定活動名稱
- **WHEN** 管理員在設定表單輸入活動名稱並送出
- **THEN** 系統將活動名稱 upsert 至 Supabase `event_settings` 表並顯示成功訊息

#### Scenario: EVENT_ID 格式驗證
- **WHEN** 管理員送出空白或無效的 EVENT_ID
- **THEN** 系統顯示錯誤訊息，不寫入 Supabase

#### Scenario: 活動名稱為選填
- **WHEN** 管理員未填寫活動名稱
- **THEN** 系統允許儲存（`event_name` 寫入 null 或空字串），前台將顯示預設名稱「活動報到」

### Requirement: 提供公開 API 取得活動名稱
系統 SHALL 提供公開 API（/api/event）讓前台取得活動名稱，資料來源改為 Supabase。

#### Scenario: 取得活動名稱
- **WHEN** 前台呼叫 /api/event
- **THEN** 系統從 Supabase `event_settings` 讀取並回傳活動名稱

#### Scenario: 未設定活動名稱時回傳預設值
- **WHEN** Supabase `event_settings` 表為空或 `event_name` 為 null/空字串
- **THEN** 系統回傳預設值「活動報到」
