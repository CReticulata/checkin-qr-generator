## MODIFIED Requirements

### Requirement: EVENT_ID from environment
系統 SHALL 依照以下優先順序讀取 EVENT_ID：
1. Vercel Blob Storage 的 settings.json
2. 環境變數 EVENT_ID
3. 若皆無設定，回傳錯誤

#### Scenario: 從 Blob Storage 讀取 EVENT_ID
- **WHEN** Blob Storage 的 settings.json 存在且包含有效的 eventId
- **THEN** 系統使用 Blob Storage 中的 eventId 值

#### Scenario: 退回使用環境變數
- **WHEN** Blob Storage 無設定或讀取失敗
- **THEN** 系統使用環境變數 EVENT_ID 的值

#### Scenario: 無可用的 EVENT_ID
- **WHEN** Blob Storage 無設定且環境變數未設定
- **THEN** 系統記錄錯誤並阻止 QR Code 生成
