## ADDED Requirements

### Requirement: 系統必須提供 CSV 上傳 API 端點
系統 SHALL 提供 `POST /api/admin/upload-csv` 端點，接受 multipart/form-data 格式的 CSV 檔案上傳。

#### Scenario: 成功上傳 CSV 檔案
- **WHEN** 已驗證的管理員上傳有效的 CSV 檔案
- **THEN** 系統將檔案儲存到 Vercel Blob Storage 並回傳成功訊息與載入的參與者數量

#### Scenario: 上傳非 CSV 格式檔案
- **WHEN** 使用者上傳非 CSV 格式的檔案
- **THEN** 系統回傳 400 錯誤並顯示「僅接受 CSV 檔案格式」訊息

#### Scenario: 上傳空檔案
- **WHEN** 使用者上傳空的 CSV 檔案
- **THEN** 系統回傳 400 錯誤並顯示「CSV 檔案不可為空」訊息

### Requirement: 上傳 API 必須驗證管理員權限
系統 SHALL 驗證請求者具有管理員權限才允許上傳。

#### Scenario: 未登入使用者嘗試上傳
- **WHEN** 未登入的使用者呼叫上傳 API
- **THEN** 系統回傳 401 Unauthorized 錯誤

#### Scenario: 非管理員使用者嘗試上傳
- **WHEN** 已登入但 email 不在 ADMIN_EMAILS 白名單的使用者呼叫上傳 API
- **THEN** 系統回傳 403 Forbidden 錯誤並顯示「您沒有管理員權限」訊息

#### Scenario: 管理員使用者上傳
- **WHEN** 已登入且 email 在 ADMIN_EMAILS 白名單的使用者呼叫上傳 API
- **THEN** 系統允許上傳並處理檔案

### Requirement: 上傳前必須驗證 CSV 格式
系統 SHALL 在儲存到 Blob Storage 前驗證 CSV 格式正確性。

#### Scenario: 驗證必要欄位存在
- **WHEN** 解析上傳的 CSV 檔案
- **THEN** 系統驗證至少有 5 個欄位（第 2 欄為 ticket number，第 5 欄為 email）

#### Scenario: CSV 欄位不足
- **WHEN** CSV 檔案的欄位數少於 5
- **THEN** 系統回傳 400 錯誤並顯示「CSV 格式錯誤：欄位數不足」訊息

#### Scenario: 顯示驗證結果
- **WHEN** CSV 驗證通過
- **THEN** 系統回傳成功訊息，包含有效的參與者記錄數量

### Requirement: CSV 檔案必須儲存到 Vercel Blob Storage
系統 SHALL 使用 `@vercel/blob` 套件將 CSV 檔案上傳到 Vercel Blob Storage。

#### Scenario: 使用固定檔名儲存
- **WHEN** 儲存 CSV 檔案到 Blob Storage
- **THEN** 系統使用固定檔名 `participants.csv` 覆蓋既有檔案

#### Scenario: 儲存失敗處理
- **WHEN** Vercel Blob Storage 儲存失敗
- **THEN** 系統回傳 500 錯誤並顯示「儲存失敗，請稍後再試」訊息
