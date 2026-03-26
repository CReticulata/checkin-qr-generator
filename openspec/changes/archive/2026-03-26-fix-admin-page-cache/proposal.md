## Why

上傳 CSV 後管理員頁面的人數沒有更新，因為 Next.js 快取了頁面渲染結果和 fetch 請求。需要禁用快取讓資料即時更新。

## What Changes

- 在 Admin 頁面強制動態渲染（禁用頁面快取）
- 在 csvLoader 的 fetch 請求中禁用快取

## Capabilities

### New Capabilities

（無新增功能）

### Modified Capabilities

（無規格層級的變更，這是純實作層級的修復）

## Impact

- 受影響程式碼：`app/admin/page.tsx`、`src/lib/csvLoader.ts`
- 變更範圍：新增快取控制設定
