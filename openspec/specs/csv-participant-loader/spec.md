## Requirements

### Requirement: System must parse CSV file with correct column mapping
系統 SHALL 從 Vercel Blob Storage 讀取最新的 `participants-*.csv` 檔案，提取 email（第 5 欄，index 4）和票號（第 2 欄，index 1）。

#### Scenario: Find latest CSV file
- **WHEN** 系統需要查詢參與者資料
- **THEN** 系統列出所有 `participants-*.csv` 檔案，按 `uploadedAt` 排序，取最新的一個

#### Scenario: CSV file parsing
- **WHEN** 找到最新的 CSV 檔案
- **THEN** 系統從該檔案讀取並解析所有資料列

#### Scenario: Header row handling
- **WHEN** 解析 CSV 檔案
- **THEN** 系統跳過第一列（標題列）並只處理資料列

#### Scenario: Column extraction
- **WHEN** 處理每一列 CSV 資料
- **THEN** 系統從 index 4 提取 email，從 index 1 提取票號

#### Scenario: No CSV file found
- **WHEN** Blob Storage 中沒有 `participants-*.csv` 檔案
- **THEN** 系統記錄警告並回傳空的參與者清單

### Requirement: System must build email-to-ticket lookup map
系統 SHALL 建立以 email 為鍵、票號為值的 Map 結構，提供 O(1) 查詢效能。

#### Scenario: Map construction
- **WHEN** CSV 解析完成
- **THEN** 系統建立 Map<string, string>，以 email 為鍵、票號為值

#### Scenario: Email normalization in map
- **WHEN** 將項目加入 map
- **THEN** 系統將所有 email 鍵轉換為小寫，實現不區分大小寫的查詢

#### Scenario: Duplicate email handling
- **WHEN** CSV 包含重複的 email 地址
- **THEN** 系統使用第一次出現的記錄並記錄警告

### Requirement: CSV loader must provide lookup function
系統 SHALL 提供函數以 O(1) 時間複雜度透過 email 查詢票號。

#### Scenario: Successful email lookup
- **WHEN** 使用已註冊的 email 呼叫查詢函數
- **THEN** 系統回傳對應的票號

#### Scenario: Failed email lookup
- **WHEN** 使用未註冊的 email 呼叫查詢函數
- **THEN** 系統回傳 null

#### Scenario: Case-insensitive lookup
- **WHEN** 使用混合大小寫的 email（例如 User@Example.com）進行查詢
- **THEN** 系統無視大小寫差異找到匹配記錄

### Requirement: Upload CSV with timestamped filename
系統 SHALL 使用帶時間戳的檔名上傳 CSV，並先刪除舊檔案。

#### Scenario: Delete old files before upload
- **WHEN** 管理員上傳新的 CSV 檔案
- **THEN** 系統先刪除所有現有的 `participants-*.csv` 檔案

#### Scenario: Upload with timestamp
- **WHEN** 刪除舊檔案完成後
- **THEN** 系統以 `participants-{timestamp}.csv` 格式上傳新檔案

## REMOVED Requirements

### Requirement: CSV file must be stored securely
**Reason**: CSV 檔案改為儲存在 Vercel Blob Storage，不再使用本地檔案系統
**Migration**: 參與者資料透過 `/admin` 頁面上傳到 Vercel Blob Storage，不再需要 src/data/ 目錄
