## Context

`blob-csv-upload` 是上一輪變更後殘留的 capability stub。當時為了不破壞既有 archive 的引用結構，選擇保留 spec 檔並把要求重寫為 Supabase 版本，但這讓 `openspec/specs/` 下同時存在 `blob-csv-upload` 與 `supabase-participant-storage` 兩個要求重疊的 capability，容易造成混淆。

## Goals / Non-Goals

**Goals:**
- 讓 `openspec/specs/` 與實際程式碼架構保持一致
- 消除命名誤導（"blob" 暗示還在用 Vercel Blob）

**Non-Goals:**
- 不動任何實作程式碼
- 不更動歷史 archive 中的 `blob-csv-upload` spec 引用
- 不重命名 `supabase-participant-storage`

## Decisions

### 決策 1：整個 capability 資料夾一併刪除

選擇直接 `rm -rf openspec/specs/blob-csv-upload/` 而非留下空 spec，因為 OpenSpec 是以資料夾存在與否判斷 capability，保留空檔案反而會留下死 capability。

### 決策 2：以 REMOVED delta 表達

Delta spec 以 `## REMOVED Requirements` 列出要被移除的那一條要求，archive 時 OpenSpec 會套用刪除。檔名仍需位於 `specs/blob-csv-upload/spec.md` 以對應被修改的 main spec。

## Risks / Trade-offs

- **[風險] 歷史 archive 中對 `blob-csv-upload` 的引用失效**：archive 是靜態快照，不會動態解析，無實際影響。
- **[Trade-off] 若未來真的要重新引入 Blob 儲存，需要重新建立 capability**：接受，目前沒有該需求。
