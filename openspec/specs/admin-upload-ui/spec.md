## ADDED Requirements

### Requirement: 系統必須提供管理員上傳頁面
系統 SHALL 提供 `/admin` 頁面讓管理員上傳參與者 CSV 檔案。

#### Scenario: 管理員存取上傳頁面
- **WHEN** 管理員存取 `/admin` 頁面
- **THEN** 系統顯示檔案上傳表單和目前參與者數量

#### Scenario: 非管理員存取上傳頁面
- **WHEN** 非管理員使用者存取 `/admin` 頁面
- **THEN** 系統顯示「您沒有權限存取此頁面」訊息並提供登出按鈕

#### Scenario: 未登入使用者存取上傳頁面
- **WHEN** 未登入使用者存取 `/admin` 頁面
- **THEN** 系統重新導向至登入頁面

### Requirement: 上傳表單必須顯示上傳狀態
系統 SHALL 在上傳過程中顯示適當的狀態回饋。

#### Scenario: 上傳中顯示載入狀態
- **WHEN** 使用者點擊上傳按鈕
- **THEN** 系統顯示載入指示器並停用上傳按鈕

#### Scenario: 上傳成功顯示結果
- **WHEN** CSV 上傳成功
- **THEN** 系統顯示成功訊息和載入的參與者數量

#### Scenario: 上傳失敗顯示錯誤
- **WHEN** CSV 上傳失敗
- **THEN** 系統顯示錯誤訊息說明失敗原因

### Requirement: 上傳頁面必須支援拖放上傳
系統 SHALL 支援拖放檔案到上傳區域。

#### Scenario: 拖放 CSV 檔案
- **WHEN** 使用者將 CSV 檔案拖放到上傳區域
- **THEN** 系統自動選取該檔案並顯示檔案名稱

#### Scenario: 點擊選擇檔案
- **WHEN** 使用者點擊上傳區域
- **THEN** 系統開啟檔案選擇對話框

### Requirement: 上傳頁面必須提供 CSV 格式說明
系統 SHALL 顯示預期的 CSV 格式說明幫助管理員準備檔案。

#### Scenario: 顯示格式說明
- **WHEN** 管理員存取上傳頁面
- **THEN** 系統顯示 CSV 格式說明（第 2 欄為票號，第 5 欄為 email）

#### Scenario: 提供範例下載
- **WHEN** 管理員點擊「下載範例 CSV」
- **THEN** 系統下載一個包含正確格式的範例 CSV 檔案
