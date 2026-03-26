## 1. 設定儲存與讀取工具

- [x] 1.1 建立 `src/lib/eventSettings.ts`，定義設定介面（eventId、eventName、updatedAt）
- [x] 1.2 實作設定讀取函式（從 Blob Storage 讀取 settings.json）
- [x] 1.3 實作設定寫入函式（將設定儲存至 Blob Storage）
- [x] 1.4 實作 getEventId() 函式，依優先順序讀取 EVENT_ID（Blob → 環境變數）
- [x] 1.5 實作 getEventName() 函式，回傳活動名稱或預設值「活動報到」

## 2. 管理員設定 API

- [x] 2.1 建立 `app/api/admin/settings/route.ts`
- [x] 2.2 實作 GET handler，回傳目前的活動設定（eventId、eventName）及來源
- [x] 2.3 實作 POST handler，儲存活動設定（eventId 必填、eventName 選填）
- [x] 2.4 加入管理員權限驗證（401/403 錯誤處理）
- [x] 2.5 加入 EVENT_ID 格式驗證（不可為空）

## 3. 公開活動資訊 API

- [x] 3.1 建立 `app/api/event/route.ts`
- [x] 3.2 實作 GET handler，回傳活動名稱（不需驗證）
- [x] 3.3 若未設定活動名稱，回傳預設值「活動報到」

## 4. 管理介面 UI

- [x] 4.1 建立 `app/admin/EventSettingsForm.tsx` 客戶端元件
- [x] 4.2 實作 EVENT_ID 輸入欄位（必填）
- [x] 4.3 實作活動名稱輸入欄位（選填）
- [x] 4.4 實作表單送出邏輯（呼叫 POST API）
- [x] 4.5 顯示設定來源標示（Blob Storage / 環境變數 / 預設值）
- [x] 4.6 整合至 `/admin/page.tsx`

## 5. 前台顯示活動名稱

- [x] 5.1 修改 `app/page.tsx`（登入頁），呼叫 /api/event 取得並顯示活動名稱
- [x] 5.2 修改 `app/dashboard/page.tsx`，在標題處顯示活動名稱
- [x] 5.3 處理活動名稱載入中狀態

## 6. QR Code 生成邏輯修改

- [x] 6.1 修改 `src/lib/qrGenerator.ts` 的 getEventId() 函式，使用新的設定讀取邏輯
- [x] 6.2 更新 generateQRCode() 函式，支援非同步讀取 EVENT_ID
- [x] 6.3 更新 validateQRConfig() 函式

## 7. 測試與驗證

- [x] 7.1 驗證未登入使用者無法存取管理員設定 API（401）
- [x] 7.2 驗證非管理員無法存取管理員設定 API（403）
- [x] 7.3 驗證可成功儲存與讀取 eventId 和 eventName
- [x] 7.4 驗證 QR Code 使用新的 EVENT_ID 設定
- [x] 7.5 驗證當 Blob Storage 無設定時，退回使用環境變數
- [x] 7.6 驗證登入頁正確顯示活動名稱
- [x] 7.7 驗證 Dashboard 頁正確顯示活動名稱
- [x] 7.8 驗證未設定活動名稱時顯示預設值「活動報到」
