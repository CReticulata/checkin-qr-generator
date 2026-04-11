## MODIFIED Requirements

### Requirement: CSV 檔案必須儲存到 Supabase participants 表
系統 SHALL 在伺服器端解析上傳的 CSV 後，以「先清空 `participants` 表、再批次 insert」的方式將解析結果寫入 Supabase，取代先前寫入 Vercel Blob Storage 的做法。API 路徑維持 `POST /api/admin/upload-csv`。

#### Scenario: 解析並寫入 Supabase
- **WHEN** 已驗證的管理員上傳有效的 CSV 檔案
- **THEN** 系統於伺服器端以 `csv-parse` 解析 CSV，提取每一列的 email（index 4）與 ticket number（index 1），將 email 轉為小寫並組成批次，清空舊 `participants` 資料後批次 insert

#### Scenario: 批次寫入成功
- **WHEN** Supabase 批次 insert 成功
- **THEN** API 回傳成功訊息與寫入的參與者列數

#### Scenario: 清空舊資料
- **WHEN** 系統準備寫入新批次
- **THEN** 系統先對 `participants` 表執行刪除全部資料的操作（例如 `.delete().neq('email', '')`），確保舊批次完全被取代

#### Scenario: 批次寫入失敗
- **WHEN** Supabase insert 發生錯誤
- **THEN** 系統回傳 500 錯誤並顯示「儲存失敗，請重新上傳」訊息；此時資料表可能為空，呼叫端需知曉需重新上傳

#### Scenario: 跳過標題列
- **WHEN** 解析 CSV
- **THEN** 系統跳過第一列（標題列），僅處理資料列

#### Scenario: 欄位不足跳過
- **WHEN** 某一列欄位數少於 5
- **THEN** 系統跳過該列並記錄警告，繼續處理其他列

## REMOVED Requirements

### Requirement: 系統必須提供 CSV 上傳 API 端點
**Reason**: 要求內容中提到「儲存到 Vercel Blob Storage」與 Supabase 語意衝突；由新要求「CSV 檔案必須儲存到 Supabase participants 表」取代，API 端點本身與上傳驗證規則仍有效但併入新要求描述。
**Migration**: 端點路徑 `POST /api/admin/upload-csv` 不變；所有既有呼叫端無需改動，僅需確保 Supabase 環境變數已設定。

### Requirement: 上傳前必須驗證 CSV 格式
**Reason**: 驗證行為合併進「解析並寫入 Supabase」流程中（解析 csv-parse 時若結構錯誤會拋出，由 API route 統一攔截回 400）。
**Migration**: 實作層仍然驗證欄位數量與必要欄位，惟要求已合併至新要求的 Scenario 中。

### Requirement: 上傳 API 必須驗證管理員權限
**Reason**: 權限驗證邏輯完全不變，僅因 capability 整體重寫而由 `admin-event-settings` 或共用 auth middleware 統一描述，不再於本 capability 重複。
**Migration**: 實作上保留原有 `requireAdmin()` 呼叫，未登入回 401、非管理員回 403 的行為不變。
