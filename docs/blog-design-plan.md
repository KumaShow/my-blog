# 部落格改版規劃文件

> 建立日期：2026-08-07
> 修訂：2026-08-07 依 `docs/blog-design-plan-review.md` 審查結果修訂（v2）
> 狀態：Phase 1（資料層、路徑一致性與 production 驗證）已完成（2026-08-31）；Phase 2 起尚未實作
> 這份文件記錄「技術深淵」部落格從 Astro 官方範本改造成「主題式技術筆記知識庫」的完整規劃，為需求討論與審查修訂後的最終結論。

---

## 1. 定位與目標

- **定位**：以「主題系列」為軸的軟體開發學習筆記站（數位花園／知識庫），而非按時間軸排列的傳統部落格。
- **內容範疇**：第一階段純技術筆記；資料結構預留未來擴充：**Project 作品集、Notes 指令速查、參考資源（常用工具網站）**。
- **部署環境**：GitHub repo 管理程式碼，**Cloudflare Pages** 部署，已綁定網域 `https://blog.stackabyss.dev`。

## 2. 需求決策記錄

| 項目 | 決策 |
|---|---|
| 首頁 | 簡介（hero）＋ 最新文章 ＋ 主題分類入口卡片 |
| 側邊欄 | 僅「筆記區」顯示主題分類樹（Node.js、Vue.js、Docker⋯）；文章內頁隱藏 |
| 分類頁 | 卡片格狀呈現該系列文章（標題＋摘要） |
| 文章內頁 | 隱藏側邊欄；右側 sticky TOC（H2＋H3、scroll spy）；上一篇／下一篇（同系列）；程式碼複製按鈕；閱讀進度條 |
| Tags 頁 | 混合式：tag 雲（含數量）＋各 tag 分組列表，且每個 tag 有獨立子頁 `/tags/[tag]/` |
| 排序 | 系列內文章：完整 comparator 見 §3.5 |
| 配色 | 深／淺色可切換，預設跟隨系統，選擇記憶於 localStorage |
| 站內搜尋 | 之後再加（規劃 Pagefind），列入 backlog |
| 多語系 | UI＋文章皆需雙語（繁中／英文）；**整體延後導入**（見 §7），現階段不放任何半成品欄位 |
| 留言系統 | 暫不需要 |

### 審查後定案的技術決策（v2）

| 議題 | 定案 |
|---|---|
| category 唯一真相來源 | **文章路徑第一段**（`blog/nodejs/foo.md` → category = `nodejs`），frontmatter 不設 `category` 欄位，杜絕兩者不一致 |
| 不存在的 category | 文章所屬資料夾若無對應 `categories/*.json`，**build 直接失敗**並提示建立指令 |
| 多語系欄位 | **不加 `lang`、不加 `translationKey`**；未來以「相同 category/slug 路徑」作為中英文配對 key（見 §7） |
| draft 行為 | dev 顯示草稿（加標示）；production 的 HTML、RSS、sitemap、tags、上下篇**全部排除**；一律透過共用 helper 取文章（見 §3.4） |
| tag 格式 | frontmatter tags 一律 URL-safe 小寫 slug（`^[a-z0-9]+(-[a-z0-9]+)*$`），schema 驗證＋不得重複；顯示直接用 slug；自然語言顯示名列入 backlog |
| URL 規則 | `trailingSlash: 'always'`＋directory 輸出；canonical 用正規化後的 pathname；category 與 slug 同用上述 slug 格式；上線前接受因 category 改名造成的 URL 變更 |
| 404 頁 | 納入 Phase 2 |
| category icon | 用 emoji（單一字串欄位） |
| mobile TOC | `< xl` 改為文章頂部 `<details>` 摺疊目錄 |
| tag 雲字級 | 固定字級，僅顯示數量，不做依數量縮放 |
| new-post 遇不存在分類 | 直接失敗並印出建立 JSON 的提示指令，不做互動式建立 |

## 3. 內容架構設計（資料層）

### 3.1 資料夾結構

放棄現行「年份／分類」結構（`blog/2025/other/`），改為**主題分類為軸**（年份資訊由 `pubDate` 承載）：

```
src/content/
├── blog/                      # 技術筆記；第一層資料夾＝category
│   ├── nodejs/
│   │   ├── global-objects.md
│   │   └── express-basics.md
│   ├── vuejs/
│   └── docker/
└── categories/                # 分類的 metadata（一個分類一個 JSON）
    ├── nodejs.json
    ├── vuejs.json
    └── docker.json
```

- **category 以路徑第一段為唯一真相來源**，由 helper 從 `post.id` 解析（如 `nodejs/global-objects` → `nodejs`）。
- 文章網址 = `blog/` 之下的相對路徑：`nodejs/global-objects.md` → `/blog/nodejs/global-objects/`。
- 同一資料夾內 slug 天然不重複（檔案系統保證）；跨分類允許同名 slug（URL 含 category 不衝突）。
- 網站尚未正式上線、無舊網址包袱，現在是重構的最佳時機。
- 未來擴充內容型態時，新增平行的 collection：`src/content/projects/`、`src/content/snippets/`（指令速查）、`src/content/resources/`（參考資源）。

### 3.2 blog collection schema（`src/content.config.ts`）

```ts
const TAG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: z.string().min(1).max(200),
      description: z.string().min(10).max(300),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.string().startsWith('/').optional(), // public 絕對路徑
      tags: z
        .array(z.string().regex(TAG_PATTERN, 'tag 必須是小寫 slug'))
        .default([])
        .refine((t) => new Set(t).size === t.length, 'tags 不得重複'),
      order: z.number().int().positive().optional(), // 系列內閱讀順序
      draft: z.boolean().default(false),
    })
    .refine((d) => !d.updatedDate || d.updatedDate >= d.pubDate, {
      message: 'updatedDate 不可早於 pubDate',
    }),
});
```

注意：**沒有 `category` 欄位**（由路徑推導）、**沒有 `lang` 欄位**（多語系延後整體導入，見 §7）。

### 3.3 categories collection

分類的顯示名稱、圖示、排序集中管理：

```jsonc
// src/content/categories/nodejs.json
{
  "label": "Node.js",
  "description": "Node.js 執行環境、原生模組與後端框架筆記",
  "icon": "🟢",          // emoji（定案）
  "order": 3              // 側邊欄與首頁分類卡片的排列順序
}
```

```ts
const categories = defineCollection({
  loader: glob({ base: './src/content/categories', pattern: '*.json' }),
  schema: z.object({
    label: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().int().positive().default(999),
  }),
});
```

**一致性驗證（build fail，不用 warning）**：於共用 helper 或 `astro:build:start` 階段檢查——每個 `blog/` 第一層資料夾都必須有對應的 `categories/<name>.json`，缺少時丟出錯誤並提示：「請建立 `src/content/categories/<name>.json`」。

文章 entry id 也必須嚴格符合 `<category>/<slug>` 兩層結構；`category` 與 `slug` 均套用 `^[a-z0-9]+(-[a-z0-9]+)*$`。根目錄文章、額外巢狀層級或含有大寫、底線、點號的路徑，都必須在共用 helper 驗證時讓 build 失敗，並指出問題文章與正確路徑範例。

### 3.4 共用資料存取 helper（`src/utils/posts.ts`）

所有頁面**一律**透過 helper 取文章，禁止直接呼叫 `getCollection('blog')`，確保 draft 過濾與排序規則只實作一次：

```ts
getPublishedPosts()            // dev 含 draft（呼叫端可標示）、prod 排除 draft
getCategoryOf(post)            // 由 post.id 解析 category（路徑第一段）
getPostsByCategory(category)   // 已過濾 + 已依 §3.5 排序
sortPostsInCategory(posts)     // §3.5 comparator
getAdjacentPosts(post)         // 上一篇／下一篇（同分類、依 §3.5 序列）
getAllTags()                   // tag → 文章數，已排除 draft
assertCategoriesConsistency()  // §3.3 的一致性驗證
```

draft 行為定義：
- **dev**（`import.meta.env.DEV`）：顯示草稿，UI 加「草稿」標示。
- **production build**：HTML 頁面、RSS、sitemap、tags 統計、上下篇導覽、首頁最新文章**全部排除** draft。

### 3.5 排序規則（完整 comparator）

系列內文章（側邊欄、分類頁、上下篇導覽）的總排序：

1. 有 `order` 的文章在前，`order` 由小到大。
2. 相同 `order`：以 `pubDate` 由舊到新，再以 slug 字典序。
3. 無 `order` 的文章排在所有有 `order` 者之後：以 `pubDate` **由新到舊**，再以 slug 字典序。

上一篇／下一篇方向：沿此排序序列，「上一篇」＝序列中的前一筆、「下一篇」＝後一筆（即沿學習路徑往後讀）。

首頁「最新文章」與 tags 頁列表則單純以 `pubDate` 新到舊。

## 4. 路由與頁面架構

```
/                        首頁：hero 簡介 → 最新文章（5 篇）→ 分類入口卡片
/blog/                   筆記總覽：側邊欄 ＋ 全部/最新筆記
/blog/[category]/        分類頁：側邊欄 ＋ 該系列卡片格狀列表
/blog/[category]/[slug]/ 文章內頁：無側邊欄，右側 TOC
/tags/                   Tag 雲（含數量）＋ 各 tag 分組文章列表
/tags/[tag]/             單一 tag 的文章列表（無文章的 tag 不產生頁面）
/about/                  關於我
/404                     找不到頁面（Phase 2）
/rss.xml                 RSS（沿用，經 helper 過濾 draft）
```

### URL 規則（定案）

- Astro config 設 `trailingSlash: 'always'`，build 維持 directory 輸出（`foo/index.html`）；Cloudflare Pages 會將無斜線請求 301 至斜線版本，與 canonical 一致。
- canonical 使用正規化後的 `Astro.url.pathname`（確保結尾斜線）＋ `Astro.site`。
- category 與文章 slug 格式：`^[a-z0-9]+(-[a-z0-9]+)*$`，文章路徑嚴格為 `<category>/<slug>`（new-post 腳本與 §3.3 驗證把關）。
- 上線前接受 category 改名造成的 URL 變更；正式上線後改名需在 Cloudflare Pages `_redirects` 補 301。

Header 導覽列：`首頁｜筆記｜Tags｜關於` ＋ 主題切換按鈕（＋未來的搜尋按鈕、語系切換預留位）。

## 5. 版面設計重點

### 5.1 首頁
1. **Hero**：SITE_TITLE「技術深淵」＋ 自我介紹（來自 `consts.ts`）。
2. **最新文章**：全站最新 5 篇（依 `pubDate`），列表式（日期＋標題＋分類徽章）。
3. **分類入口**：卡片牆，每張卡片＝一個分類（icon＋label＋描述＋文章數），依 categories 的 `order` 排序，點擊進 `/blog/[category]/`。

### 5.2 筆記區側邊欄（`/blog/**`，文章內頁除外）
- 樹狀結構：第一層為分類（依 categories `order`），展開後列出該系列文章（依 §3.5 排序）。
- 當前分類自動展開、當前項目高亮。
- 響應式：`< lg` 斷點收為 drawer（漢堡按鈕開合）；drawer 需支援 Escape 關閉、開閉時焦點移轉與 `aria-expanded`。
- 不分群組（不做「系統化學習／工程實踐」這種第二層群組），維持單層分類。

### 5.3 分類頁
- 麵包屑：`🏠 › 筆記 › Node.js`。
- 分類標題＋描述（來自 categories collection）。
- 文章卡片格狀（2 欄、`< md` 1 欄）：標題＋description 摘要，依 §3.5 排序。
- 空分類（有 JSON 但尚無文章）：顯示「此系列籌備中」空狀態，不出錯。

### 5.4 文章內頁
- **無側邊欄**，版面：麵包屑 ＋ 標題區（title、日期、分類、tags 徽章）→ 內文 ＋ 右側 sticky TOC。
- **TOC**：H2＋H3 兩層，IntersectionObserver 實作 scroll spy 高亮當前章節，點擊平滑捲動（尊重 `prefers-reduced-motion`）；`< xl` 斷點改為文章頂部 `<details>` 摺疊目錄（定案）。
- **閱讀進度條**：視窗頂部細條。
- **程式碼複製按鈕**：每個 code block 右上角，複製成功顯示可存取的提示（`aria-live`），並有視覺回饋。
- **上一篇／下一篇**：文章底部，依 §3.5 序列取前後篇。
- tags 徽章點擊 → `/tags/[tag]/`。

### 5.5 Tags 頁（混合式）
- `/tags/`：上方 tag 雲（`#nodejs (12)` 帶數量，**固定字級**），下方各 tag 分組的文章列表（日期＋標題），tag 雲點擊錨點跳轉至該分組。
- `/tags/[tag]/`：獨立子頁，供文章內頁徽章連結與 SEO；`getStaticPaths` 由 `getAllTags()` 產生，**無文章的 tag 不產生頁面**。
- Tag 一律為小寫 slug（§3.2 schema 強制），無大小寫碰撞問題；顯示直接用 slug（如 `#nodejs`）。需要自然語言顯示名（如「Node.js」）時，再於 backlog 引入 tags metadata（slug＋label 分離）。

### 5.6 深／淺色主題
- Tailwind 4 `dark` variant（`@custom-variant dark`，以 `data-theme` 或 `.dark` class 控制）。
- 預設跟隨 `prefers-color-scheme`；手動切換後寫入 `localStorage`。
- `<head>` 內放 inline script 於 render 前套用主題，避免 FOUC 閃爍。

## 6. new-post 腳本調整（`scripts/new-post.mjs`）

- 移除 year 資料夾邏輯（`getLatestYear` 相關）。
- 路徑改為 `src/content/blog/<category>/<slug>.md`。
- frontmatter 模板：`title`、`description`、`pubDate`、`tags`、`order`（可選）、`draft: true`（新文章預設為草稿）；**不含 `category`**（由路徑決定）。
- 新增參數：`--tags a,b,c`（驗證 slug 格式）、`--order 3`（正整數）、`--draft/--no-draft`。
- **category 檢核（定案）**：`src/content/categories/<category>.json` 不存在時直接失敗，並印出提示，例如：
  「分類 `nodejs` 不存在，請先建立 `src/content/categories/nodejs.json`（範本見 docs/blog-design-plan.md §3.3）」。

預期用法：

```bash
npm run new-post -- --title "NodeJS｜全域物件與執行環境" --category nodejs --tags nodejs,runtime --order 1
```

## 7. 多語系規劃（整體延後，不留半成品欄位）

**目標**：UI 與文章皆支援繁中／英文；英文版文章可能由 AI 翻譯產生，同一篇筆記中英兩份 md。

**現階段決策（v2 修訂）**：schema **不加** `lang` 或 `translationKey`——避免未接線的欄位被誤認為多語系地基已完成。唯一的低成本鋪墊是 Phase 2 將 UI 字串集中到 `src/i18n/ui.ts` 字典檔（元件不寫死中文字）。

**未來導入時一次完成的事項**：
- Astro 內建 i18n routing：`defaultLocale: 'zh-tw'`（網址不加前綴，現有網址不變）、英文加 `/en/` 前綴。
- 內容遷移為 locale 資料夾：`blog/zh-tw/nodejs/foo.md`、`blog/en/nodejs/foo.md`；`getStaticPaths` 對預設語系剝除 locale 段，`/blog/nodejs/foo/` 網址不變。
- **中英文配對 key＝相同的 `category/slug` 路徑**（取代 translationKey；路徑即穩定 ID）。
- categories schema 擴充多語欄位（`label` → `{ 'zh-tw': ..., en: ... }`）；tags 維持 slug 不翻譯。
- 首頁、RSS、上下篇、tags 統計依語系分流；無翻譯時 fallback 繁中並顯示提示。
- canonical、`hreflang` 與 sitemap 的多語系設定。

## 8. 實作階段規劃

| 階段 | 內容 | 主要產出 |
|---|---|---|
| **Phase 1：資料層** | schema 更新、categories collection、一致性驗證（build fail）、`src/utils/posts.ts` helpers、資料夾重構、測試文章搬移、new-post 腳本改寫 | 內容地基完成 |
| **Phase 2：全站骨架** | Header／Footer 改版、深淺色切換、UI 字串字典化、首頁三區塊、404 頁、`trailingSlash` 設定、BaseHead 修正（見下方已知問題） | 新版首頁與導覽 |
| **Phase 3：筆記區** | 側邊欄樹（含 mobile drawer 與無障礙行為）、`/blog/` 總覽、分類卡片頁、麵包屑、空分類狀態 | 筆記瀏覽動線完成 |
| **Phase 4：文章內頁** | TOC scroll spy＋mobile `<details>`、閱讀進度條、程式碼複製、上下篇導覽、文章頁 SEO（見下） | 閱讀體驗完成 |
| **Phase 5：Tags** | `/tags/` 混合頁、`/tags/[tag]/` 子頁、文章頁徽章串接 | Tag 系統完成 |

### 各 Phase 共通驗收條件

- `npm run build`、`npm run lint`、`npm run format:check` 全數通過。
- 手機／平板／桌面三種 breakpoint 目視驗證。
- 鍵盤可操作、focus 狀態可見。
- draft 不出現在 production 的 HTML、RSS、sitemap（Phase 1 起每階段抽查）。
- 深淺色首次載入無明顯閃爍（Phase 2 起）。
- 動畫遵守 `prefers-reduced-motion`。
- 互動元件的無障礙行為：drawer（Escape／焦點回復／`aria-expanded`）、copy button（`aria-live` 成功提示）。

### 文章頁 SEO（併入 Phase 4）

- `og:type=article`、`article:published_time`、`article:modified_time`。
- `BlogPosting` JSON-LD。
- 分類頁與 tags 頁的 title／description 規則（如 `Node.js 筆記｜技術深淵`）。
- canonical 與 trailing slash 一致性（Phase 2 已定基礎）。

### 已知問題（Phase 2 已完成項目）

- [x] `src/components/BaseHead.astro` 預設 OG 圖片已修正為現有檔案 `/blog/blog-placeholder-1.jpg`（2026-09-08）。
- [x] canonical 已搭配 `trailingSlash: 'always'` 正規化，Open Graph／Twitter URL 也共用相同 canonical URL（2026-09-08）。

### Backlog（記錄備查，不排時程）

- 站內搜尋：**Pagefind**（build 後建索引，支援中文，Cloudflare Pages 靜態部署可直接用）。
- 多語系實作（§7）。
- tags metadata（slug＋自然語言 label 分離）。
- 新內容集合：projects、snippets（指令速查）、resources（參考資源）。
- 留言系統（giscus，目前不需要）。
- OG image 自動產生、Archive 年份歸檔頁。
- 範本示範文（`markdown-style-guide.md`、`using-mdx.mdx`）目前保留作語法參考，正式上線前移除或轉為 draft。

---

*本文件由需求討論與 `docs/blog-design-plan-review.md` 審查修訂而成；實作時若有偏離此規劃的決定，請回頭更新本文件。*
