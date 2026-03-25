專案名稱：活動報到 QRcode 生成工具 (Event Check-in QR Generator)

1. 專案目標
   開發一個 Web 應用，參加者透過 Google 登入後，系統比對 CSV 內容，產出 EVENT_ID:Ticket_number 的 QRcode。

2. CSV 資料格式與解析規範
   檔案路徑：專案根目錄下的 participants.csv。
   欄位說明：
   Email: 第 5 欄 (Index 4)
   Ticket number: 第 2 欄 (Index 1)
   解析邏輯：
   由於 CSV 第一行是標頭 (Header)，請務必跳過第一行。
   請使用 Node.js 的 csv-parse 或類似套件處理（處理好逗號分隔、引號包覆的資料）。
   請將資料解析為 Map<email, ticket_number> 的結構，以便 $O(1)$ 時間複雜度查詢。
3. 核心流程 (User Flow)
   管理員設定：放置 participants.csv，並在 .env 設定 EVENT_ID。
   使用者登入：使用者透過 Google OAuth 登入。
   查找與驗證：
   取得登入者的 Email。
   在 Map 中查找該 Email 對應的 Ticket number。
   邊緣情況處理：若 Email 找不到，跳轉至「報名資料不存在」錯誤頁面；若找到多筆（理論上不該發生），取第一筆。
   生成 QRcode：使用 library 生成包含 ${EVENT_ID}:${ticket_number} 的 QRcode。
4. 給 AI Agent 的實作 prompt (直接複製此段即可)
   請依照上述規格與 CSV 格式，幫我完成這個工具，請確保遵循以下技術指導：

CSV 讀取器實作：

請編寫一個 lib/csvLoader.ts，負責讀取 participants.csv。
請使用 fs 模組讀取檔案，並正確處理 CSV 格式（包含處理標頭 row）。
回傳一個 Map<string, string>，Key 為 email (全部轉小寫以確保比對準確)，Value 為 ticket_number。
安全性與部署建議：

請確保 participants.csv 不會被公開訪問（放在 src/data 或與 source code 一起編譯打包，不要放在 public/ 資料夾）。
在 Next.js 的 API route 中讀取該 CSV（或在 server component 中讀取）。
QRcode 生成：

使用 qrcode (npm package) 來處理。
請提供一個簡單的 React Component 顯示 QRcode。
檔案結構：

請提供建議的目錄結構 (例如 src/app/api/auth/[...nextauth]/route.ts, src/app/dashboard/page.tsx 等)。
CSV 範例比對：

請注意我的 CSV 欄位，Email 是第 5 欄，Ticket number 是第 2 欄，解析邏輯請依照此順序實作。
請開始實作，並解釋各個步驟。
