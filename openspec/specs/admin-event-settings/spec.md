## ADDED Requirements

### Requirement: 管理員可在介面設定活動資訊
系統 SHALL 提供管理員介面讓已授權的管理員設定活動識別碼（EVENT_ID）與活動名稱（eventName）。

#### Scenario: 顯示目前活動設定
- **WHEN** 管理員進入 /admin 頁面
- **THEN** 系統顯示目前的 EVENT_ID 與活動名稱設定值及其來源（Blob Storage 或環境變數/預設值）

#### Scenario: 設定新的 EVENT_ID
- **WHEN** 管理員在設定表單輸入新的 EVENT_ID 並送出
- **THEN** 系統儲存設定至 Blob Storage 並顯示成功訊息

#### Scenario: 設定活動名稱
- **WHEN** 管理員在設定表單輸入活動名稱並送出
- **THEN** 系統儲存活動名稱至 Blob Storage 並顯示成功訊息

#### Scenario: EVENT_ID 格式驗證
- **WHEN** 管理員送出空白或無效的 EVENT_ID
- **THEN** 系統顯示錯誤訊息，不儲存設定

#### Scenario: 活動名稱為選填
- **WHEN** 管理員未填寫活動名稱
- **THEN** 系統允許儲存，前台將顯示預設名稱「活動報到」

### Requirement: 活動設定持久化於 Blob Storage
系統 SHALL 將活動設定（eventId、eventName）儲存於 Vercel Blob Storage 的 settings.json 檔案中。

#### Scenario: 儲存設定
- **WHEN** 管理員更新活動設定
- **THEN** 系統將設定寫入 Blob Storage 的 settings.json

#### Scenario: 讀取設定
- **WHEN** 系統需要讀取活動設定
- **THEN** 系統從 Blob Storage 讀取 settings.json 並解析 eventId 與 eventName 欄位

### Requirement: 設定 API 需驗證管理員權限
系統 SHALL 確保只有已授權的管理員能存取設定 API（/api/admin/settings）。

#### Scenario: 未登入使用者存取 API
- **WHEN** 未登入的使用者呼叫設定 API
- **THEN** 系統回傳 401 Unauthorized 錯誤

#### Scenario: 非管理員存取 API
- **WHEN** 已登入但非管理員的使用者呼叫設定 API
- **THEN** 系統回傳 403 Forbidden 錯誤

### Requirement: 提供公開 API 取得活動名稱
系統 SHALL 提供公開 API（/api/event）讓前台取得活動名稱，無需驗證。

#### Scenario: 取得活動名稱
- **WHEN** 前台呼叫 /api/event
- **THEN** 系統回傳活動名稱（eventName）

#### Scenario: 未設定活動名稱時回傳預設值
- **WHEN** Blob Storage 無設定或 eventName 為空
- **THEN** 系統回傳預設值「活動報到」
