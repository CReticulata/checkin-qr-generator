## Context

目前系統使用本地檔案系統儲存參與者 CSV (`src/data/participants.csv`)，透過 Node.js `fs` 模組在啟動時載入到記憶體中的 Map。這個設計在 Vercel serverless 環境有限制：

1. Serverless 函數是無狀態的，每次冷啟動都需要重新載入資料
2. 本地檔案系統是唯讀的，無法在執行時更新
3. 更新資料需要重新部署整個應用程式

Vercel Blob Storage 是 Vercel 提供的物件儲存服務，適合儲存這類需要動態更新的檔案。

## Goals / Non-Goals

**Goals:**
- 允許在不重新部署的情況下更新參與者名單
- 提供簡單的上傳介面給管理員
- 保持現有的 email 查詢功能和效能
- 確保上傳功能有適當的權限控制

**Non-Goals:**
- 不建立完整的管理後台（只需簡單的上傳功能）
- 不支援即時編輯單一參與者（僅支援整批上傳）
- 不處理並發上傳衝突（假設單一管理員操作）

## Decisions

### 決策 1：使用 Vercel Blob Storage

**選擇**: Vercel Blob Storage

**替代方案考慮**:
- **Vercel KV**: 適合小型 key-value 資料，但 CSV 可能有數千筆資料，不適合
- **外部資料庫 (Supabase/PlanetScale)**: 功能更強，但對這個簡單需求來說過度設計
- **Vercel Edge Config**: 有 512KB 限制，不適合大型 CSV

**理由**: Blob Storage 簡單、便宜、與 Vercel 整合良好，適合儲存檔案型資料。

### 決策 2：每次請求都從 Blob 讀取

**選擇**: 每次 API 請求都從 Blob 讀取並解析 CSV

**替代方案考慮**:
- **使用快取**: 加入 TTL 快取減少 Blob 讀取次數
- **預處理為 JSON**: 上傳時先轉換為 JSON 格式儲存

**理由**:
- 簡單實作優先，避免快取失效的複雜性
- Vercel Blob 有 CDN 快取，延遲已經很低
- CSV 檔案通常只有幾 KB，解析成本可接受
- 如有效能問題，之後可以加入 Edge Config 快取

### 決策 3：管理員驗證使用現有 NextAuth + Email 白名單

**選擇**: 複用現有的 Google OAuth，加上管理員 email 白名單環境變數

**替代方案考慮**:
- **獨立的管理員密碼**: 簡單但需要額外的認證流程
- **Vercel Password Protection**: 付費功能，且無法程式化控制

**理由**: 複用現有認證機制，只需要加一個環境變數 `ADMIN_EMAILS` 來指定誰可以上傳。

### 決策 4：上傳 API 設計

**選擇**: `POST /api/admin/upload-csv` 接受 multipart/form-data

**實作細節**:
1. 驗證使用者已登入且 email 在 ADMIN_EMAILS 白名單中
2. 驗證檔案為 CSV 格式
3. 解析 CSV 驗證格式正確（至少有 email 和 ticket 欄位）
4. 上傳到 Vercel Blob，使用固定檔名 `participants.csv`
5. 回傳成功訊息和載入的參與者數量

## Risks / Trade-offs

**[風險] Blob Storage 服務中斷** →
- 影響：參與者無法查看 QR code
- 緩解：Vercel Blob 有 SLA 保證，且可以保留一個備份檔案

**[風險] 上傳錯誤格式的 CSV** →
- 影響：所有使用者都無法登入
- 緩解：上傳前驗證 CSV 格式，顯示預覽確認

**[風險] 冷啟動延遲** →
- 影響：第一次請求可能較慢
- 緩解：CSV 通常很小，影響有限；必要時可加 Edge Config 快取

**[Trade-off] 每次請求都讀取 Blob vs 快取**
- 選擇簡單實作，接受略高的延遲
- 好處是上傳後立即生效，無需等待快取過期
