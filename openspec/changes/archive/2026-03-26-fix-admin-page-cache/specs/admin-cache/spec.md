## MODIFIED Requirements

### Requirement: Admin 頁面顯示即時資料

系統必須（SHALL）在管理員頁面載入時顯示最新的參與者人數，不使用快取資料。

#### Scenario: 上傳 CSV 後重新載入頁面
- **WHEN** 管理員上傳新的 CSV 檔案後頁面重新載入
- **THEN** 頁面顯示新上傳的 CSV 檔案中的參與者人數
