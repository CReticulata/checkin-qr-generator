## 1. 刪除 blob-csv-upload spec

- [x] 1.1 `rm -rf openspec/specs/blob-csv-upload/`
- [x] 1.2 執行 `openspec list` 確認 capability 已從清單中消失
- [x] 1.3 搜尋 repo 確認沒有其他地方仍引用 `blob-csv-upload`（除了歷史 archive）

## 2. 歸檔

- [x] 2.1 執行 `/opsx:archive remove-blob-csv-upload-capability`
