## Context

系統使用 Vercel Blob Storage 儲存 participants.csv 檔案。Vercel Blob 的 CDN 預設 `cacheControlMaxAge` 為 1 年，會長期快取檔案內容。

嘗試過但無效的方案：
- URL query string `?t={timestamp}` - CDN 可能忽略
- `cache: 'no-store'` fetch 選項 - 只影響 Next.js 層
- `noStore()` - 只影響 Next.js Data Cache
- `revalidatePath()` - 只影響頁面快取

根本問題是 Vercel Blob CDN 層的快取，無法從讀取端控制。

## Goals / Non-Goals

**Goals:**
- 確保每次讀取 CSV 都能取得最新內容
- 徹底避開 CDN 快取問題

**Non-Goals:**
- 保留舊的檔案版本（每次上傳會刪除舊檔案）

## Decisions

### 決策 1：使用帶時間戳的檔名

**選擇**：每次上傳使用 `participants-{timestamp}.csv` 格式的新檔名

**理由**：
- 每次上傳都是全新的 URL，徹底避開 CDN 快取
- 不依賴任何快取控制設定
- 100% 可靠

**替代方案考慮**：
1. **URL query string**：CDN 可能忽略，實測無效
2. **設定 cacheControlMaxAge: 0**：只對新上傳有效，舊檔案仍被快取
3. **使用 downloadUrl**：實測仍有快取問題

### 決策 2：上傳前刪除舊檔案

**選擇**：上傳新 CSV 前，先刪除所有 `participants-*.csv` 檔案

**理由**：
- 避免 Blob Storage 累積多個版本
- 節省儲存空間
- 簡化讀取邏輯（雖然仍按時間排序取最新）

## Risks / Trade-offs

- **[無法回滾]** → 舊檔案會被刪除，無法恢復。可接受，因為管理員可重新上傳
- **[檔名格式變更]** → 既有的 `participants.csv` 不再被讀取。需手動重新上傳一次
