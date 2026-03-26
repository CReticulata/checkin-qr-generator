## MODIFIED Requirements

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

### Requirement: Upload CSV with timestamped filename
系統 SHALL 使用帶時間戳的檔名上傳 CSV，並先刪除舊檔案。

#### Scenario: Delete old files before upload
- **WHEN** 管理員上傳新的 CSV 檔案
- **THEN** 系統先刪除所有現有的 `participants-*.csv` 檔案

#### Scenario: Upload with timestamp
- **WHEN** 刪除舊檔案完成後
- **THEN** 系統以 `participants-{timestamp}.csv` 格式上傳新檔案
