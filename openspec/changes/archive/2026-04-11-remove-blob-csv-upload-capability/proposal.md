## Why

`blob-csv-upload` capability 在 `migrate-csv-storage-to-supabase` 變更後已被 `supabase-participant-storage` 實質取代，目前 `openspec/specs/blob-csv-upload/spec.md` 只剩一條與 Supabase 寫入流程重複的 stub requirement。名稱中的 "blob" 也具誤導性，容易讓未來的開發者以為專案還在用 Vercel Blob。刪除這個 capability 可讓 spec 結構與實際架構保持一致。

## What Changes

- **BREAKING**: 完全移除 `blob-csv-upload` capability 的 spec 檔案（`openspec/specs/blob-csv-upload/spec.md`）
- 該 capability 的所有要求由 `supabase-participant-storage` 繼承，沒有實際的行為或程式碼變動

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `blob-csv-upload`: 整個 capability 移除

## Impact

- **Spec 檔案**：刪除 `openspec/specs/blob-csv-upload/` 目錄
- **程式碼**：無變動，`app/api/admin/upload-csv/route.ts` 的行為已由 `supabase-participant-storage` 規範
- **歷史參考**：歷次 archive 中的 `blob-csv-upload` 仍保留不動
