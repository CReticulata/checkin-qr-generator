## Context

Next.js App Router 預設會快取 Server Component 的渲染結果，以及使用 `fetch` 的請求。這導致上傳新 CSV 後，頁面重新載入時仍顯示舊的參與者人數。

## Goals / Non-Goals

**Goals:**
- Admin 頁面每次載入都顯示最新的參與者人數
- CSV 資料每次都從 Blob Storage 取得最新版本

**Non-Goals:**
- 不實作 client-side 的即時更新（維持現有的頁面重新載入機制）

## Decisions

### Decision 1: 使用 `dynamic = 'force-dynamic'` 強制動態渲染

在 `app/admin/page.tsx` 匯出 `dynamic` 設定，讓 Next.js 不快取此頁面。

### Decision 2: 在 fetch 請求加入 `cache: 'no-store'`

在 `src/lib/csvLoader.ts` 的 fetch 請求中加入 `cache: 'no-store'`，確保每次都取得最新資料。

## Risks / Trade-offs

- **[效能降低]** → 接受此限制，管理員頁面使用頻率低，即時性比效能重要。
