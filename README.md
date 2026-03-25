# 活動報到 QR Code 生成器

一個基於 Next.js 的網頁應用程式，參加者透過 Google OAuth 認證後，系統會比對 CSV 檔案中的報名資料，為已註冊的參加者生成專屬的 QR Code。

## 功能特色

- Google OAuth 2.0 身份驗證
- 基於 CSV 檔案的參加者查詢，查詢效能為 O(1)
- 伺服器端 QR Code 生成
- 響應式設計，支援手機與桌面裝置
- 參加者資料的安全處理

## 系統需求

- Node.js 18+ 與 npm
- Google Cloud Console 專案及 OAuth 2.0 憑證
- CSV 格式的參加者報名資料

## 快速開始

### 1. 安裝專案

```bash
npm install
```

### 2. 設定 Google OAuth 憑證

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API：
   - 導航至「API 和服務」>「程式庫」
   - 搜尋「Google+ API」並啟用
4. 建立 OAuth 2.0 憑證：
   - 前往「API 和服務」>「憑證」
   - 點擊「建立憑證」>「OAuth 2.0 用戶端 ID」
   - 選擇「網頁應用程式」
   - 新增授權重新導向 URI：`http://localhost:3000/api/auth/callback/google`
   - 正式環境請新增：`https://yourdomain.com/api/auth/callback/google`
5. 複製用戶端 ID 和用戶端密碼

### 3. 設定環境變數

在專案根目錄建立 `.env.local` 檔案：

```bash
# Google OAuth 憑證
GOOGLE_CLIENT_ID=你的_google_client_id
GOOGLE_CLIENT_SECRET=你的_google_client_secret

# NextAuth 設定
# 使用以下指令產生：openssl rand -base64 32
NEXTAUTH_SECRET=你的_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# 活動設定
EVENT_ID=EVENT001
```

產生 NEXTAUTH_SECRET：
```bash
openssl rand -base64 32
```

### 4. 準備參加者 CSV 檔案

在 `src/data/participants.csv` 建立參加者資料檔案

**重要欄位對應：**
- 第 2 欄（索引 1）：**票券編號**
- 第 5 欄（索引 4）：**電子郵件**

**CSV 格式範例：**

```csv
Registration ID,Ticket Number,Name,Phone,Email,Registration Date
REG001,TKT-12345,王小明,+886912345678,wang@example.com,2024-01-15
REG002,TKT-12346,李小華,+886912345679,lee@example.com,2024-01-16
```

**CSV 檔案要求：**
- 第一列必須是標頭（解析時會跳過）
- 每列至少 5 個欄位
- 電子郵件位於第 5 欄（索引 4）
- 票券編號位於第 2 欄（索引 1）
- 電子郵件不區分大小寫（系統會自動標準化）

### 5. 執行應用程式

**開發環境：**
```bash
npm run dev
```

開啟瀏覽器前往 `http://localhost:3000`

**正式環境：**
```bash
npm run build
npm start
```

## 使用流程

1. **參加者進入應用程式**
   - 看到登入頁面與「使用 Google 登入」按鈕

2. **身份驗證**
   - 點擊「使用 Google 登入」
   - 重新導向至 Google OAuth 同意畫面
   - 授權應用程式存取

3. **報名資料驗證**
   - 系統在 CSV 檔案中查詢電子郵件
   - 若找到：繼續生成 QR Code
   - 若找不到：重新導向至錯誤頁面

4. **QR Code 生成**
   - 系統生成格式為 `EVENT_ID:票券後七碼` 的 QR Code
   - 例如：票券編號 GOOGA262822187 會生成 `117197:2822187`
   - 儀表板顯示 QR Code、電子郵件與完整票券編號
   - 使用者可以截圖或將頁面加入書籤

5. **活動報到**
   - 參加者在活動入口處出示 QR Code
   - 主辦單位掃描 QR Code 進行驗證

## CSV 檔案管理

### 上傳參加者資料

參加者資料透過管理員介面上傳，儲存於 Vercel Blob Storage：

1. 以管理員帳號登入後，前往 `/admin` 頁面
2. 將 CSV 檔案拖放到上傳區域，或點擊選擇檔案
3. 點擊「上傳 CSV」按鈕
4. 上傳成功後立即生效，無需重新部署

**管理員設定：** 在環境變數 `ADMIN_EMAILS` 中加入管理員的 email（多個用逗號分隔）

### 更新參加者資料

直接在 `/admin` 頁面上傳新的 CSV 檔案即可覆蓋舊資料，無需重新部署應用程式。

### CSV 安全性

- CSV 檔案儲存在 Vercel Blob Storage（非公開目錄）
- 僅管理員可以上傳和更新資料
- 資料僅在伺服器端存取
- 不會將參加者資訊暴露給客戶端

## 專案結構

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts          # NextAuth.js 設定
│   │   └── admin/upload-csv/
│   │       └── route.ts          # CSV 上傳 API
│   ├── admin/
│   │   ├── page.tsx              # 管理員上傳頁面
│   │   ├── AdminUploadForm.tsx   # 上傳表單元件
│   │   └── SampleCsvDownload.tsx # 範例 CSV 下載元件
│   ├── dashboard/
│   │   ├── page.tsx              # QR Code 顯示頁面（伺服器元件）
│   │   └── LogoutButton.tsx      # 登出按鈕客戶端元件
│   ├── error/
│   │   └── page.tsx              # 未註冊使用者的錯誤頁面
│   ├── page.tsx                  # 登入頁面
│   ├── layout.tsx                # 根佈局
│   └── globals.css               # 全域樣式
├── src/lib/
│   ├── csvLoader.ts              # CSV 解析與參加者查詢（從 Blob Storage 讀取）
│   ├── auth.ts                   # 身份驗證工具
│   ├── admin.ts                  # 管理員權限檢查
│   └── qrGenerator.ts            # QR Code 生成
├── .env.local                    # 環境變數（不納入 git）
└── .env.example                  # 環境變數範例
```

## API 與技術細節

### CSV 載入器 (`src/lib/csvLoader.ts`)

- **資料來源**：從 Vercel Blob Storage 讀取 `participants.csv`
- **查詢**：`getTicketNumber(email: string)` - O(1) 電子郵件到票券的查詢
- **資料結構**：每次請求從 Blob 讀取並建立 `Map<string, string>`
- **錯誤處理**：Blob 讀取失敗時回傳空結果，不中斷服務

### 身份驗證 (`src/lib/auth.ts`)

- **會話管理**：`getSession()` - 伺服器端會話擷取
- **電子郵件標準化**：`normalizeEmail(email: string)` - 轉小寫 + 去空白
- **驗證**：`isValidSession(session)` - 檢查會話有效性

### QR Code 生成 (`src/lib/qrGenerator.ts`)

- **生成**：`generateQRCode(ticketNumber: string)` - 建立 base64 資料 URL
- **格式**：`EVENT_ID:票券後七碼`（例如：`117197:2822187`）
- **票券編號處理**：自動擷取票券編號的後七碼
- **選項**：300x300px、中度錯誤修正、4px 邊界

## 疑難排解

### OAuth 錯誤

**問題**：「連接 Google 時發生錯誤」
- 驗證 `.env.local` 中的 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`
- 檢查 Google Cloud Console 中的重新導向 URI 是否符合
- 確保已啟用 Google+ API

**問題**：「重新導向 URI 不符」
- 在 Google Cloud Console 中新增正確的重新導向 URI：
  - 開發環境：`http://localhost:3000/api/auth/callback/google`
  - 正式環境：`https://yourdomain.com/api/auth/callback/google`

### CSV 格式問題

**問題**：「尚未上傳參與者 CSV 檔案」
- 前往 `/admin` 頁面上傳 CSV 檔案
- 確認已設定 `ADMIN_EMAILS` 環境變數

**問題**：「CSV 中沒有找到有效的參加者記錄」
- 驗證 CSV 有資料列（不只有標頭）
- 檢查欄位數量（最少 5 欄）
- 確保電子郵件在第 5 欄（索引 4）、票券在第 2 欄（索引 1）

**問題**：「找不到報名資料」但電子郵件存在於 CSV 中
- 電子郵件比對不區分大小寫
- 檢查 CSV 中是否有多餘的空白
- 驗證標頭列存在（第一列會被跳過）

### 環境設定

**問題**：應用程式無法啟動
- 執行 `openssl rand -base64 32` 產生 `NEXTAUTH_SECRET`
- 驗證 `.env.local` 中的所有必要變數
- 檢查是否已設定 `EVENT_ID`

**問題**：QR Code 生成失敗
- 驗證已設定 `EVENT_ID` 環境變數
- 檢查主控台日誌的具體錯誤訊息

## 部署

### Vercel（建議）

1. 將程式碼推送至 GitHub 儲存庫
2. 在 Vercel 儀表板匯入專案
3. 啟用 Vercel Blob Storage：
   - 前往專案設定 > Storage
   - 點擊「Create Database」> 選擇「Blob」
   - 建立完成後會自動新增 `BLOB_READ_WRITE_TOKEN` 環境變數
4. 在 Vercel 專案設定中新增其他環境變數：
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`（設為正式網域）
   - `EVENT_ID`
   - `ADMIN_EMAILS`（管理員 email，多個用逗號分隔）
5. 部署
6. 前往 `/admin` 頁面上傳參與者 CSV 檔案

**重要**：使用正式環境 URL 更新 Google Cloud Console 的重新導向 URI。

### 其他平台

其他主機平台：
1. 建置應用程式：`npm run build`
2. 在主機平台設定環境變數
3. 上傳 `src/data/participants.csv` 至伺服器
4. 執行：`npm start`

## 安全性考量

- **CSV 資料**：儲存於 `src/data/`（不可公開存取）
- **OAuth 憑證**：以環境變數保護（絕不寫在程式碼中）
- **會話管理**：基於 JWT，有效期 30 天
- **伺服器端處理**：所有參加者查詢與 QR Code 生成在伺服器執行
- **不暴露客戶端**：參加者資料絕不傳送至瀏覽器

## 測試清單

上線前請檢查：

- [ ] 使用已註冊電子郵件測試 Google OAuth 登入
- [ ] 使用未註冊電子郵件測試（應顯示錯誤頁面）
- [ ] 測試不區分大小寫的電子郵件比對（例如 `User@Example.COM`）
- [ ] 驗證 QR Code 格式：`EVENT_ID:票券後七碼`（例如：`117197:2822187`）
- [ ] 使用行動裝置測試 QR Code 掃描
- [ ] 測試登出功能
- [ ] 驗證無法透過 URL 存取 CSV 檔案
- [ ] 檢查行動與桌面裝置的響應式佈局
- [ ] 測試未驗證使用者存取 `/dashboard`（應重新導向）

## 技術支援

如有問題或疑問：
- 電子郵件：support@example.com
- 請更新此處為您實際的支援聯絡方式

## 授權

ISC

---

使用 Next.js、NextAuth.js 與 QRCode 建構
