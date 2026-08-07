# 部落格改版規劃審查

> 審查文件：`docs/blog-design-plan.md`
>
> 審查日期：2026-08-07
>
> 範圍：核對規劃內容與目前 Astro 專案結構，僅提出分析與建議，不包含實作。

## 結論

整體資訊架構、頁面分工與五階段拆分合理，足以作為改版方向；但目前不建議維持「已定案」狀態直接進入實作。資料模型、路由規則與驗收條件仍有幾個會造成後續返工的缺口。

開工前最需要補齊的是：

1. `category` 的唯一真相來源。
2. 多語文章與分類 metadata 的配對方式。
3. 集中式 draft、排序與 tag 處理規則。
4. URL、slug、trailing slash 與錯誤策略。

## 必須補充

### 1. 定義 `category` 的唯一真相來源

規劃同時使用文章路徑 `blog/nodejs/foo.md` 與 frontmatter `category: nodejs`，但又指定 `category` 是唯一真相來源（原規劃第 65、76 行）。兩者可能不一致，導致 sidebar、麵包屑、分類頁與上一篇／下一篇產生不同結果。

建議二選一：

- 以文章路徑第一段作為 category，移除 frontmatter 的 `category`。
- 保留 frontmatter，但 build 時驗證它與資料夾名稱一致；不一致時直接讓 build 失敗。

文章引用不存在的分類時，也建議讓 build 失敗，而不是只顯示 fallback 或 console warning。

### 2. 補完整多語系資料模型

目前只有 `lang` 欄位與 UI 字典的規劃，尚未定義：

- 中英文文章的穩定配對 ID，例如 `translationKey`。
- categories 的多語 label 與 description。
- tags 顯示名稱是否需要翻譯。
- 首頁、RSS、上一篇／下一篇是否依語系分流。
- 缺少翻譯時的 canonical、fallback 與 `hreflang` 行為。

若多語系確實是近期需求，建議現在加入 `translationKey`，並讓分類 metadata 支援中英文。若優先度非常低，則可暫時移除 `lang`，待真正導入 locale 路徑時一次完成，避免現在的欄位被誤認為已完成多語系地基。

### 3. 集中 draft 過濾

目前文章總覽、動態路由與 RSS 都會各自呼叫 `getCollection('blog')`：

- `src/pages/blog/[...slug].astro`
- `src/pages/blog/index.astro`
- `src/pages/rss.xml.js`

未來還會新增首頁、sidebar、tags 與上一篇／下一篇。只要漏掉一個入口，draft 就可能被發布。

建議建立共用 helper，例如：

```ts
getPublishedPosts()
getPostsByCategory()
sortPostsInCategory()
```

並明確定義開發環境是否顯示 draft，以及 production build、sitemap、RSS、tags 和文章導覽是否全部排除 draft。

### 4. 寫完整排序規則

目前只定義「有 `order` 者優先，未填者按日期」，還缺少：

- 無 `order` 時日期是新到舊還是舊到新。
- 相同 `order` 如何排序。
- 相同日期如何排序。
- `order` 是否限制為正整數。
- 上一篇／下一篇的方向。

建議採用以下總排序規則：

1. 有 `order` 的文章在前，數字由小到大。
2. 相同 `order` 以 `pubDate` 由舊到新，再以 slug 排序。
3. 無 `order` 的文章排後面，以 `pubDate` 由新到舊，再以 slug 排序。
4. `order` 使用 `z.number().int().positive().optional()`。

### 5. 寫清楚 tag 正規化與碰撞策略

「小寫 slug、顯示第一次出現的原始大小寫」仍無法處理 `Node.js`／`nodejs`、`C#`、空白、斜線與中文 tag，也可能因 collection 讀取順序而產生不穩定的顯示名稱。

文章量少時，可採簡單方案：frontmatter tags 一律使用 URL-safe 的小寫 slug，並在 schema 與 `new-post` 腳本中驗證。若需要保留自然顯示文字，則應新增 tags metadata，分開管理 `slug` 與 `label`。

### 6. 定義 URL 與錯誤策略

規劃使用 trailing slash URL，但尚未定義：

- 無 slash URL 是否導向 slash URL。
- category 與 slug 的允許格式。
- 重複 slug 如何處理。
- category 改名是否接受文章 URL 變更。
- 404 頁是否納入本次實作。

目前 canonical 會直接採用請求 pathname；因此必須先定案 URL 規則，並在 Astro config、canonical 與站內連結中一致執行。

## 建議優化

### Schema 約束

可進一步加入：

- `description` 長度上下限。
- `order` 為正整數。
- tags 不得重複。
- category／slug 格式驗證。
- `updatedDate >= pubDate` 的驗證。
- hero image 使用 public 絕對路徑，或改用 Astro image schema 的明確規則。

### 解決文件中的未定選項

目前文件標示「已定案」，但仍保留幾個會影響實作的選項：

- category icon 使用 emoji 或 icon 元件名稱。
- mobile TOC 要隱藏，或改成文章頂部摺疊目錄。
- tag 雲字級是否依數量調整。
- category 不存在時是否互動建立 JSON。

建議 Phase 1 先採固定且可預測的方案：使用 emoji、mobile TOC 使用 `<details>`、category 不存在時直接失敗並提示建立指令。

### 補上跨階段驗收條件

目前只有 Phase 1 明確寫出 `npm run build` 通過。每個 Phase 建議至少補上：

- `npm run build`、`npm run lint`、`npm run format:check`。
- 手機、平板、桌面 breakpoint 驗證。
- 鍵盤操作與 focus 狀態。
- draft 不出現在 HTML、RSS、sitemap。
- 深淺色主題首次載入無明顯閃爍。
- drawer 支援 Escape、焦點回復與 `aria-expanded`。
- copy button 有可存取的成功提示。
- 動畫遵守 `prefers-reduced-motion`。

### SEO 項目

可在 Phase 2 或 Phase 4 納入：

- 文章頁 `og:type=article`。
- `article:published_time` 與 `article:modified_time`。
- `BlogPosting` JSON-LD。
- category、tags 頁的 title 與 description 規則。
- 空分類、空 tag 頁與 404 頁的處理。
- canonical 與 trailing slash 一致性。

另外，目前 `src/components/BaseHead.astro` 的預設 OG 圖片是 `/blog-placeholder-1.jpg`，而實際檔案在 `public/blog/blog-placeholder-1.jpg`；改版時應一併修正。

## 建議的開工前決策清單

- [ ] category 由路徑或 frontmatter 主導。
- [ ] 不存在的 category 是否直接使 build 失敗。
- [ ] 多語系採 `translationKey`，或延後整體導入。
- [ ] draft 的開發環境與 production 行為。
- [ ] 完整文章排序 comparator。
- [ ] tag slug 格式與碰撞處理。
- [ ] trailing slash、slug 與 404 策略。
- [ ] icon、mobile TOC 等文件中的選項定案。
- [ ] 各 Phase 的 build、lint、格式與無障礙驗收條件。

