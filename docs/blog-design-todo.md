# 部落格改版 TODO 清單

> 產生日期：2026-08-08  
> 最後更新：2026-09-08
> 依據：`docs/blog-design-plan.md` 與目前工作目錄實作盤點  
> 狀態：Phase 1 核心資料層、文章路徑一致性與 production 驗證已完成（2026-08-31）；Phase 2～5 待實作

## 執行原則

- 依 P0 → P1 → P2 順序處理；同一優先級內依 Phase 順序進行。
- 每個 Phase 完成後，執行 `npm run build`、`npm run lint`、`npm run format:check`。
- 所有頁面必須透過 `@utils/posts` 取得文章，不直接呼叫 `getCollection('blog')`。
- production 的 HTML、RSS、sitemap、tags 與上下篇導覽不得包含 draft。
- 每批修改需同時驗證手機、平板、桌面版面以及鍵盤操作。

## P0：Phase 1 收尾與一致性驗證

### 1. 確認現行文章目錄與分類 metadata

- [x] 確認原先盤點的 `src/content/blog/2026/uncategorized/test.md` 已不在目前 checkout，不再列為現行阻擋項目。
- [x] 確認目前文章均位於 `src/content/blog/<category>/<slug>.md` 或 `.mdx` 兩層結構，不使用年份資料夾。
- [x] 確認目前第一層 `demo` category 有對應的 `src/content/categories/demo.json`。
- [x] 目前內容通過 Content Collection schema 驗證。

驗收條件：

- [x] `2026` 不再被解析成 category。
- [x] 不需要建立不具分類意義的 `src/content/categories/2026.json`。
- [x] 目前文章通過 Content Collection schema 驗證。
- [x] `assertCategoriesConsistency()` 未因目前內容拋出錯誤。

### 2. 強化手動新增文章的路徑驗證

相關檔案：`src/utils/posts.ts`、`src/content.config.ts`、`scripts/new-post.mjs`

- [x] `new-post` 驗證 category 符合 `^[a-z0-9]+(-[a-z0-9]+)*$`，並拒絕路徑分隔符與 dot segment。
- [x] `new-post` 將文章 slug 正規化為 URL-safe 格式，並防止路徑逸出。
- [x] 在 build-time／共用 helper 驗證手動建立的 category 符合 `^[a-z0-9]+(-[a-z0-9]+)*$`。
- [x] 在 build-time／共用 helper 驗證手動建立的文章 slug 符合相同格式。
- [x] 驗證文章路徑嚴格符合 `<category>/<slug>`，拒絕額外巢狀層級。
- [x] 錯誤訊息需指出問題文章與正確路徑範例。

驗收條件：

- [x] `new-post` 套用預定的 category／slug URL 規則。
- [x] 手動建立的文章與 `new-post` 套用一致的 URL 規則。
- [x] 不合法 category、slug 或巢狀路徑會讓 build 明確失敗。

### 3. 建立 Phase 1 production 基線

- [x] 執行 `npm run build`。
- [x] 執行 `npm run lint`。
- [x] 執行 `npm run format:check`。
- [x] 抽查 production HTML 不包含 draft。
- [x] 抽查 RSS 不包含 draft。
- [x] 抽查 sitemap 不包含 draft。
- [x] 以 `demo/first-post.md` 作為 published fixture，透過 `npm run verify:production` 驗證文章頁、RSS item 與 sitemap entry。

驗收條件：三項指令皆成功，且目前 production 輸出皆符合 draft 規則。

> 2026-08-31 驗證註記：`demo/first-post.md` 為 published fixture；`markdown-style-guide.md` 與 `using-mdx.mdx` 維持 draft。`npm run verify:production` 會檢查 published 文章頁、RSS item、sitemap entry，以及兩篇 draft 不會輸出。

## P1：Phase 2 全站骨架

### 4. 統一 URL 與基礎 SEO

相關檔案：`astro.config.mjs`、`src/components/BaseHead.astro`

- [x] 設定 `trailingSlash: 'always'`。
- [x] 正規化 canonical pathname，確保結尾 `/`。
- [x] 修正預設 OG 圖片為 `/blog/blog-placeholder-1.jpg`。
- [x] 確認 canonical、Open Graph URL、RSS 連結與站內連結規則一致。

### 5. 集中管理 UI 字串

相關檔案：新增 `src/i18n/ui.ts`、Header、Footer 與各頁面元件

- [ ] 建立繁中 UI 字典。
- [ ] 將導覽、按鈕、空狀態與互動提示移至字典。
- [ ] 現階段不加入 `lang` 或 `translationKey` 等半成品內容欄位。

### 6. 改版 Header 與 Footer

相關檔案：`src/components/Header.astro`、`src/components/Footer.astro`

- [ ] 導覽包含「首頁｜筆記｜Tags｜關於」。
- [ ] 使用 `HeaderLink` 處理 active 狀態。
- [ ] 加入主題切換按鈕。
- [ ] 補齊可見的 focus 狀態與按鈕 accessible name。
- [ ] 使用 Tailwind CSS 完成主要樣式。

### 7. 完成首頁三區塊

相關檔案：`src/pages/index.astro`、`src/utils/posts.ts`

- [ ] Hero 顯示 `SITE_TITLE` 與 `SITE_DESCRIPTION`。
- [ ] 顯示全站最新 5 篇文章，依 `pubDate` 新到舊排序。
- [ ] 最新文章顯示日期、標題與 category 徽章。
- [ ] 顯示依 category `order` 排序的分類入口卡片。
- [ ] 分類卡片顯示 icon、label、description 與文章數。
- [ ] production 首頁不顯示 draft。

### 8. 實作深／淺色主題

相關檔案：`src/components/BaseHead.astro`、`src/components/Header.astro`、`src/styles/global.css`

- [ ] 設定 Tailwind 4 dark variant。
- [ ] 預設跟隨 `prefers-color-scheme`。
- [ ] 手動選擇寫入 `localStorage`。
- [ ] 在首次 render 前套用主題，避免 FOUC。
- [ ] 主題切換動畫尊重 `prefers-reduced-motion`。

### 9. 新增 404 頁

相關檔案：新增 `src/pages/404.astro`

- [ ] 顯示明確的找不到頁面訊息。
- [ ] 提供返回首頁與筆記區的連結。
- [ ] 套用新版全站 layout、主題與 responsive 樣式。

## P1：Phase 3 筆記區

### 10. 重做筆記總覽

相關檔案：`src/pages/blog/index.astro`

- [ ] 使用共用 layout，移除目前手動組裝的 Header／Footer。
- [ ] 顯示全部或最新筆記。
- [ ] 顯示 dev draft 標示。
- [ ] 串接筆記區側邊欄。

### 11. 新增分類頁

相關檔案：新增 `src/pages/blog/[category]/index.astro`

- [ ] 顯示麵包屑、分類 icon、名稱與描述。
- [ ] 使用兩欄卡片格狀列表，`< md` 改為一欄。
- [ ] 文章依 Phase 1 comparator 排序。
- [ ] 空分類顯示「此系列籌備中」。
- [ ] 設定分類頁 title 與 description。

### 12. 實作側邊欄與 mobile drawer

相關檔案：新增筆記側邊欄元件、筆記總覽與分類頁

- [ ] category 依 metadata `order` 排序。
- [ ] category 展開後顯示已排序文章。
- [ ] 當前分類自動展開，當前項目高亮。
- [ ] `< lg` 改為 drawer。
- [ ] 支援 Escape 關閉。
- [ ] 開啟時將焦點移入 drawer，關閉時恢復焦點。
- [ ] 正確維護 `aria-expanded`。

## P1：Phase 4 文章內頁

### 13. 重做文章版面

相關檔案：`src/layouts/BlogPost.astro`、`src/pages/blog/[...slug].astro`

- [ ] 顯示麵包屑、標題、日期、更新日期、category 與 tags。
- [ ] 文章頁不顯示筆記側邊欄。
- [ ] desktop 使用內文加右側 sticky TOC 版面。
- [ ] `< xl` 在文章頂部顯示 `<details>` 摺疊目錄。
- [ ] dev 草稿顯示明確標示。

### 14. 實作 TOC 與閱讀互動

- [ ] TOC 收錄 H2 與 H3。
- [ ] 使用 `IntersectionObserver` 實作 scroll spy。
- [ ] TOC 點擊支援平滑捲動並尊重 reduced motion。
- [ ] 加入頁面頂部閱讀進度條。
- [ ] 為每個 code block 加入複製按鈕。
- [ ] 複製成功提供視覺回饋與 `aria-live` 提示。
- [ ] 加入同分類上一篇／下一篇導覽。

### 15. 補齊文章 SEO

相關檔案：`src/components/BaseHead.astro`、`src/layouts/BlogPost.astro`

- [ ] 設定 `og:type=article`。
- [ ] 輸出 `article:published_time`。
- [ ] 有更新日期時輸出 `article:modified_time`。
- [ ] 加入 BlogPosting JSON-LD。
- [ ] 確認 canonical 與 trailing slash 一致。

## P2：Phase 5 Tags

### 16. 新增 Tags 總覽頁

相關檔案：新增 `src/pages/tags/index.astro`

- [ ] 顯示固定字級的 tag 雲與文章數。
- [ ] tag 雲連結至同頁對應分組錨點。
- [ ] 顯示各 tag 的文章列表，依日期新到舊排序。
- [ ] production 的統計與列表排除 draft。
- [ ] 設定 Tags 頁 title 與 description。

### 17. 新增單一 Tag 頁

相關檔案：新增 `src/pages/tags/[tag].astro`

- [ ] 透過 `getAllTags()` 產生 static paths。
- [ ] 無文章的 tag 不產生頁面。
- [ ] 顯示該 tag 的文章列表。
- [ ] 設定單一 Tag 頁 title 與 description。

### 18. 串接文章 tags 徽章

相關檔案：`src/layouts/BlogPost.astro`

- [ ] 顯示小寫 slug 格式的 tags。
- [ ] 每個徽章連至 `/tags/[tag]/`。
- [ ] 補齊 hover、focus 與深淺色狀態。

## 各 Phase 共通驗收

- [x] `npm run build` 通過（Phase 1 production baseline）。
- [x] `npm run lint` 通過（Phase 1 production baseline）。
- [x] `npm run format:check` 通過（Phase 1 production baseline）。
- [ ] 手機、平板、桌面 breakpoint 目視驗證完成。
- [ ] 所有互動功能可使用鍵盤操作。
- [ ] focus 狀態清楚可見。
- [ ] 動畫遵守 `prefers-reduced-motion`。
- [x] 目前 production HTML、RSS、sitemap 排除 draft；tags 與上下篇功能尚未實作，待對應 Phase 驗收。

## 建議下一個最小可交付批次

- [x] 補上 build-time／共用 helper 的 category、slug 與嚴格兩層路徑驗證。
- [x] 建立可重現的 published content 驗證案例，補測正式文章頁、RSS item 與 sitemap entry。
- [x] 更新本文件與 `docs/blog-design-plan.md` 的 Phase 1 狀態描述，使兩份文件一致。
- [ ] 開始 Phase 2：URL／canonical／OG 基礎、UI 字串字典、Header／Footer、首頁、主題切換與 404。

Phase 1 已完成；下一批工作可正式進入 Phase 2。
