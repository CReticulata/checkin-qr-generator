## 1. 修復快取問題

- [x] 1.1 在 `app/admin/page.tsx` 加入 `export const dynamic = 'force-dynamic'`
- [x] 1.2 在 `src/lib/csvLoader.ts` 的 fetch 請求加入 `cache: 'no-store'`

## 2. 驗證

- [x] 2.1 測試上傳 CSV 後重新載入頁面，人數正確更新
