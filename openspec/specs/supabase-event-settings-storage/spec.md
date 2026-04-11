## Requirements

### Requirement: 活動設定必須儲存於 Supabase
系統 SHALL 在 Supabase Postgres 建立 `event_settings` 單列表格，用以儲存活動 ID 與活動名稱，取代以 Vercel Blob `settings.json` 儲存的做法。

#### Scenario: 建立 event_settings 表
- **WHEN** 系統初始化 Supabase 資料庫 schema
- **THEN** 系統建立含有 `id int primary key default 1 check (id = 1)`、`event_id text`、`event_name text`、`updated_at timestamptz default now()` 欄位的 `event_settings` 表

#### Scenario: 單列 singleton 語意
- **WHEN** 任何程式碼嘗試寫入 `event_settings`
- **THEN** 系統一律以 `id = 1` 做 upsert，確保整張表最多只有一列

#### Scenario: 啟用 RLS
- **WHEN** 建立 `event_settings` 表
- **THEN** 系統對該表啟用 RLS 且不建立任何 policy

### Requirement: 系統必須從 Supabase 讀取活動設定
系統 SHALL 提供 `getEventId()`、`getEventName()`、`getEventSettingsWithSource()` 函數，從 `event_settings` 表讀取資料並保留「Supabase → env 變數 → 預設值」的 fallback 順序。

#### Scenario: 從 Supabase 取得 event_id
- **WHEN** 呼叫 `getEventId`
- **THEN** 系統先查詢 Supabase `event_settings.event_id`，若有值則回傳該值

#### Scenario: Supabase 無設定時 fallback 至環境變數
- **WHEN** Supabase `event_settings` 表為空或 `event_id` 為 null
- **THEN** 系統回傳 `process.env.EVENT_ID`，若也未設定則回傳 `null`

#### Scenario: 取得活動名稱並 fallback 至預設值
- **WHEN** 呼叫 `getEventName`
- **THEN** 系統回傳 Supabase 中的 `event_name`，若為空則回傳預設值「活動報到」

#### Scenario: 回傳來源資訊
- **WHEN** 呼叫 `getEventSettingsWithSource`
- **THEN** 系統回傳 `eventId`、`eventIdSource`（`"supabase"` | `"env"` | `null`）、`eventName`、`eventNameSource`（`"supabase"` | `"default"`）

### Requirement: 系統必須將管理員送出的設定寫入 Supabase
系統 SHALL 提供 `saveEventSettings(eventId, eventName?)` 函數，以 upsert 將設定寫入 Supabase `event_settings` 表。

#### Scenario: 儲存新設定
- **WHEN** 管理員送出新的 event_id 與 event_name
- **THEN** 系統對 `event_settings` 執行 `upsert({ id: 1, event_id, event_name, updated_at: now() })`

#### Scenario: 儲存失敗
- **WHEN** Supabase upsert 失敗
- **THEN** 系統拋出錯誤，由上層 API route 回傳 500 並顯示「儲存失敗」訊息

#### Scenario: event_name 為選填
- **WHEN** 管理員未提供 event_name
- **THEN** 系統以 `null` 或空字串寫入 `event_name`，讀取端會 fallback 至預設值
