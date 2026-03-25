## 1. 依賴安裝與環境設定

- [x] 1.1 安裝 @vercel/blob 套件
- [x] 1.2 更新 .env.example 加入 BLOB_READ_WRITE_TOKEN 和 ADMIN_EMAILS 環境變數說明
- [x] 1.3 更新 README.md 加入 Vercel Blob Storage 設定說明

## 2. CSV Loader 重構

- [x] 2.1 修改 src/lib/csvLoader.ts 改為從 Vercel Blob Storage 讀取 CSV
- [x] 2.2 移除本地檔案系統讀取邏輯（fs.readFileSync）
- [x] 2.3 新增 Blob Storage 讀取失敗的錯誤處理
- [x] 2.4 確保 getTicketNumber 函數維持相同介面

## 3. 管理員權限驗證

- [x] 3.1 新增 src/lib/admin.ts 實作管理員權限檢查函數
- [x] 3.2 從環境變數 ADMIN_EMAILS 讀取管理員 email 白名單
- [x] 3.3 實作 isAdmin(email: string) 函數進行權限驗證

## 4. CSV 上傳 API 實作

- [x] 4.1 建立 app/api/admin/upload-csv/route.ts API 端點
- [x] 4.2 實作管理員權限驗證中介層
- [x] 4.3 實作 multipart/form-data 檔案接收
- [x] 4.4 實作 CSV 格式驗證（檢查欄位數量）
- [x] 4.5 實作上傳到 Vercel Blob Storage（使用固定檔名 participants.csv）
- [x] 4.6 回傳上傳結果和參與者數量

## 5. 管理員上傳頁面

- [x] 5.1 建立 app/admin/page.tsx 管理員頁面
- [x] 5.2 實作管理員權限檢查和未授權訊息顯示
- [x] 5.3 實作檔案拖放上傳區域
- [x] 5.4 實作上傳狀態顯示（載入中、成功、失敗）
- [x] 5.5 顯示 CSV 格式說明
- [x] 5.6 提供範例 CSV 下載功能

## 6. 清理與文件更新

- [x] 6.1 移除 .gitignore 中的 src/data/ 排除（不再需要）
- [x] 6.2 刪除 src/data/ 目錄（不再使用本地 CSV）
- [x] 6.3 更新 README.md 說明新的 CSV 上傳流程
