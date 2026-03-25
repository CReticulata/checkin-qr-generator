## 為什麼需要這個功能

活動主辦單位需要一個有效率的方式來驗證參加者在報到時的身份。目前沒有自動化系統可以比對參加者身份與報名資料，並產生可驗證的報到憑證。這導致活動報到時出現瓶頸，並增加未經授權進入的風險。

## 變更內容

- 新增 Google OAuth 認證功能，讓參加者使用已註冊的電子郵件登入
- 實作 CSV 參加者資料解析器，將電子郵件對應至票券編號
- 建立 QR Code 生成系統，產生格式為 EVENT_ID:票券後七碼的 QR Code（例如：票券 GOOGA260000000 會生成 111111:0000000）
- 建立儀表板頁面，在成功認證後顯示個人化的 QR Code
- 為未註冊的電子郵件地址新增錯誤處理與適當的使用者回饋
- 設定基於環境變數的 EVENT_ID 管理機制，以支援不同活動

## 功能模組

### 新增功能模組

- `google-oauth-auth`：Google OAuth 2.0 使用者登入認證流程
- `csv-participant-loader`：CSV 檔案解析與參加者資料管理，支援 O(1) 電子郵件查詢
- `qr-code-generation`：為已驗證參加者生成格式為 EVENT_ID:票券後七碼的 QR Code（自動擷取票券編號的後七位數字）
- `participant-verification`：基於電子郵件的參加者查詢與 CSV 資料驗證
- `dashboard-ui`：已認證使用者檢視 QR Code 的使用者介面

### 修改的功能模組

<!-- 沒有修改現有功能模組 -->

## 影響範圍

**新增檔案/目錄：**

- `src/lib/csvLoader.ts` - CSV 解析與資料載入邏輯
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js 認證設定
- `src/app/dashboard/page.tsx` - QR Code 顯示儀表板
- `src/app/error/page.tsx` - 未註冊使用者的錯誤頁面
- `src/data/participants.csv` - 參加者報名資料（不在 public/ 目錄）
- `.env.local` - EVENT_ID 與 OAuth 憑證的環境設定

**相依套件：**

- 新增 `next-auth` 用於 Google OAuth
- 新增 `csv-parse` 用於 CSV 檔案解析
- 新增 `qrcode` 用於 QR Code 生成

**安全性考量：**

- CSV 檔案必須儲存在 public 目錄之外，以防止未經授權的存取
- OAuth 憑證必須妥善保護在環境變數中
- 電子郵件比對必須不區分大小寫，以避免查詢失敗
