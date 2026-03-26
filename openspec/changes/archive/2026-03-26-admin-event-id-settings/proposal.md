## Why

目前 EVENT_ID 是透過環境變數 (.env) 設定，每次更換活動都需要修改環境變數並重新部署。這對於需要頻繁切換活動的管理員來說不夠便利。將 EVENT_ID 改為可在 /admin 管理介面中動態設定，可以讓管理員在不修改程式碼或環境變數的情況下快速切換活動。此外，新增活動名稱（eventName）設定，讓前台能顯示當前活動名稱，提升使用者體驗。

## What Changes

- 新增 EVENT_ID 與活動名稱設定功能至 /admin 管理介面
- 使用 Vercel Blob Storage 儲存活動設定（專案已經在使用此服務儲存 CSV）
- 修改 QR Code 生成邏輯，優先從 Blob Storage 讀取 EVENT_ID，若不存在則退回使用環境變數
- 在管理介面顯示目前的活動設定狀態
- 在前台（登入頁、Dashboard 頁）顯示當前活動名稱

## Capabilities

### New Capabilities
- `admin-event-settings`: 管理員可在 /admin 介面設定 EVENT_ID 與活動名稱，設定值儲存於 Vercel Blob Storage

### Modified Capabilities
- `qr-code-generation`: EVENT_ID 來源改為優先從 Blob Storage 讀取，環境變數作為備援
- `dashboard-ui`: 顯示當前活動名稱

## Impact

- **程式碼**:
  - `/admin/page.tsx` - 新增活動設定區塊（EVENT_ID、活動名稱）
  - `/app/page.tsx` - 登入頁顯示活動名稱
  - `/app/dashboard/page.tsx` - Dashboard 頁顯示活動名稱
  - `src/lib/qrGenerator.ts` - 修改 EVENT_ID 讀取邏輯
  - 新增 API route 處理活動設定儲存/讀取
- **儲存**: 使用現有的 Vercel Blob Storage（@vercel/blob）
- **向後相容**: 若 Blob Storage 中無設定，仍可使用環境變數的 EVENT_ID；活動名稱預設為「活動報到」
