# 餐廳收支 App

一套為台灣餐廳設計的手機記帳 App。重點是快速輸入、離線使用、自動整理營收／支出、追蹤尚未收款與尚未付款。

## 第一版功能

- 首頁儀表板：營業額、平台抽成、實際收入、總支出與實際盈虧
- 快速記帳：收入、進貨、員工、營運四大類
- 收付款狀態：尚未收款、尚未付款待辦
- 紀錄查詢：關鍵字、類型與完成狀態篩選
- 編輯、刪除及快速切換收付款狀態
- 統計：期間篩選、支出結構、分類排行
- 分類管理：新增、停用與重新啟用
- JSON 備份匯出
- SQLite 本機資料庫，離線可使用

## 技術架構

- Expo SDK 54（支援實體 iPhone 的 Expo Go）
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- Expo SQLite

## 開始使用

需要 Node.js 22.13 或更新版本。

```bash
pnpm install
pnpm start
```

接著可使用 Expo Go 掃描 QR Code，或啟動 Android／iOS 模擬器。

```bash
pnpm android
pnpm ios
```

## 資料說明

資料預設儲存在裝置內的 `restaurant-bookkeeping.db`。App 不需要登入或網路連線。若要換手機或保留副本，請從「設定 → 資料備份」匯出 JSON 檔案。

## 專案狀態

目前為可執行的 MVP。後續可擴充雲端備份、多人同步、多門市、發票掃描與會計匯出。

