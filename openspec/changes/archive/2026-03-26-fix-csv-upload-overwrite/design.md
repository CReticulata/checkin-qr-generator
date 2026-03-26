## Context

目前 CSV 上傳功能使用 Vercel Blob Storage 儲存參與者資料。為了保持固定的檔案路徑（`participants.csv`），程式碼設定了 `addRandomSuffix: false`，但遺漏了 `allowOverwrite: true` 選項，導致第二次上傳時會因檔案已存在而失敗。

## Goals / Non-Goals

**Goals:**
- 讓管理員能夠重複上傳 CSV 檔案來更新參與者名單
- 保持檔案路徑固定（不使用隨機後綴）

**Non-Goals:**
- 不實作版本控制或備份舊檔案功能
- 不變更現有的檔案命名策略

## Decisions

### Decision 1: 使用 `allowOverwrite: true`

**選擇方案**：在 `put` 函數中新增 `allowOverwrite: true` 選項

**替代方案考量**：
1. 使用 `addRandomSuffix: true` - 會產生不同的檔案路徑，需要額外邏輯找到最新檔案
2. 先刪除舊檔案再上傳 - 增加複雜度且有短暫的資料不可用風險
3. 使用 `allowOverwrite: true` - 最簡單直接，符合需求

**選擇理由**：`allowOverwrite: true` 是 Vercel Blob 官方推薦的解決方案，一行設定即可解決問題，且不影響現有架構。

## Risks / Trade-offs

- **[覆寫無法復原]** → 接受此限制，這是預期行為。若未來需要版本控制可另行設計。
- **[並發上傳衝突]** → 風險極低，僅管理員可上傳且操作頻率低。
