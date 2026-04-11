## REMOVED Requirements

### Requirement: CSV 檔案必須儲存到 Supabase participants 表
**Reason**: 此要求與 `supabase-participant-storage` capability 完全重複，保留會造成 spec 重疊與命名誤導。
**Migration**: 所有上傳相關要求改以 `supabase-participant-storage` capability 為權威來源，實作行為不變；`POST /api/admin/upload-csv` 端點繼續運作。
