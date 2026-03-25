## Why

目前的 CSV 參與者資料儲存在本地檔案系統 (`src/data/participants.csv`)，這在 Vercel 部署時有以下問題：
1. 每次更新名單都需要重新部署
2. 無法透過管理介面動態更新參與者資料
3. 不適合活動現場需要即時新增參與者的情境

## What Changes

- 將 CSV 儲存從本地檔案系統改為 Vercel Blob Storage
- 新增 CSV 檔案上傳 API，允許管理員上傳新的參與者名單
- 修改 CSV 載入邏輯，改從 Vercel Blob 讀取資料
- 新增簡單的管理頁面用於上傳 CSV 檔案

## Capabilities

### New Capabilities

- `blob-csv-upload`: 提供 API 端點讓管理員上傳 CSV 檔案到 Vercel Blob Storage
- `admin-upload-ui`: 簡單的管理介面用於上傳 CSV 檔案，需要驗證才能存取

### Modified Capabilities

- `csv-participant-loader`: 修改資料來源從本地檔案改為 Vercel Blob Storage，需支援動態重載資料

## Impact

- **新增依賴**: `@vercel/blob` 套件
- **環境變數**: 需設定 `BLOB_READ_WRITE_TOKEN`
- **API 變更**: 新增 `/api/admin/upload-csv` 端點
- **現有程式碼**: `src/lib/csvLoader.ts` 需重構
- **部署**: 需在 Vercel Dashboard 啟用 Blob Storage
