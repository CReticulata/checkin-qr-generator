## Context

目前系統使用環境變數 `EVENT_ID` 來設定活動識別碼，此值會被嵌入到 QR Code 中（格式：`EVENT_ID:票券後七碼`）。每次更換活動需要修改 `.env` 並重新部署，對管理員不夠友善。此外，前台目前沒有顯示活動名稱，使用者無法確認自己正在報到的是哪個活動。

專案已使用 Vercel Blob Storage 儲存參與者 CSV 檔案（`@vercel/blob` 套件），可以延用相同的儲存機制來儲存活動設定。

現有架構：
- `/admin/page.tsx` - 管理員介面（含 CSV 上傳功能）
- `/api/admin/upload-csv/route.ts` - CSV 上傳 API
- `src/lib/qrGenerator.ts` - QR Code 生成邏輯，從 `process.env.EVENT_ID` 讀取
- `/app/page.tsx` - 登入頁面
- `/app/dashboard/page.tsx` - 使用者 Dashboard（顯示 QR Code）

## Goals / Non-Goals

**Goals:**
- 管理員可在 /admin 介面直接設定 EVENT_ID 與活動名稱
- 設定值持久化儲存於 Vercel Blob Storage
- 維持向後相容：若 Blob Storage 無設定，退回使用環境變數
- 設定變更立即生效，無需重新部署
- 前台（登入頁、Dashboard）顯示當前活動名稱

**Non-Goals:**
- 多活動同時運作（每次只支援一個活動）
- 活動設定歷史記錄追蹤
- 設定變更通知機制

## Decisions

### 1. 儲存方式：使用 Vercel Blob Storage

**選擇**: 使用現有的 `@vercel/blob` 儲存 JSON 設定檔

**替代方案考量**:
- Vercel Edge Config: 適合但需額外設定，且專案尚未使用
- Vercel KV (Redis): 過度設計，單一設定值不需要 key-value store
- 環境變數動態更新: Vercel 不支援執行期修改環境變數

**理由**: 專案已整合 Blob Storage，可直接複用現有的 token 和連線設定，無需引入新依賴。

### 2. 設定檔格式

**選擇**: 儲存為 `settings.json`，格式為：
```json
{
  "eventId": "EVENT001",
  "eventName": "2024 年度開發者大會",
  "updatedAt": "2024-03-26T12:00:00Z"
}
```

**理由**: 使用 JSON 格式方便日後擴充其他設定項目。eventName 為選填，預設顯示「活動報到」。

### 3. EVENT_ID 讀取優先順序

**選擇**: Blob Storage → 環境變數 → 錯誤

**理由**: 確保向後相容，已部署的環境變數設定仍可運作。

### 4. API 設計

新增以下 API endpoints：

**管理員 API（需驗證）：**
- `GET /api/admin/settings` - 讀取目前設定（含來源資訊）
- `POST /api/admin/settings` - 更新設定

**公開 API（無需驗證）：**
- `GET /api/event` - 取得活動名稱（供前台顯示，僅回傳 eventName，不暴露 eventId）

## Risks / Trade-offs

**[風險] Blob Storage 讀取延遲**
→ 緩解：每次 QR Code 生成都會讀取設定，但 Blob Storage 讀取速度通常在 50-100ms 內，對使用者體驗影響不大。若需要可考慮加入 in-memory 快取。

**[風險] 設定檔損壞或格式錯誤**
→ 緩解：讀取時加入 try-catch 和格式驗證，失敗時退回使用環境變數。

**[風險] 未設定 EVENT_ID 的情況**
→ 緩解：UI 明確顯示目前狀態，並在未設定時顯示警告。

**[取捨] 無快取機制**
→ 為簡化實作，首版不加入快取。設定讀取頻率不高（僅在 QR Code 生成時），效能影響可接受。

## Migration Plan

1. 部署新版程式碼（含新 API 和修改後的 qrGenerator）
2. 現有環境變數 EVENT_ID 繼續生效
3. 前台活動名稱預設顯示「活動報到」
4. 管理員可在 /admin 設定 EVENT_ID 和活動名稱
5. 一旦透過 UI 設定，Blob Storage 的值將優先使用

**Rollback**: 若有問題，刪除 Blob Storage 中的 `settings.json`，系統將自動退回使用環境變數，活動名稱顯示預設值。
