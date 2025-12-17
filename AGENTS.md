# AGENTS.md - AI 開發助理指引手冊

本文件定義了 `my-blog` 專案的開發規範、技術架構與上下文。AI Agent 在生成程式碼或回答問題時，**必須**優先遵循本文件中的規則。

## 1. 專案概況與技術棧 (Tech Stack)

### 核心框架

- **Framework**: [Astro 5](https://astro.build/) (以內容為中心的網頁框架)
- **Language**: TypeScript (`.ts`, `.tsx`, `.astro` frontmatter)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Utility-first CSS)
- **Content**: MDX (`.mdx`) & Markdown (`.md`)
- **Package Manager**: npm

### 整合工具 (Integrations)

- `@astrojs/sitemap`: 自動生成網站地圖
- `@astrojs/rss`: 生成 RSS 訂閱源
- `@astrojs/partytown`: 第三方腳本優化 (Web Worker)

---

## 2. 專案目錄結構 (Project Structure)

請嚴格遵守以下目錄職責劃分：

- **`/public`**: 存放靜態資源 (圖片、字型、favicon)。這些檔案不會被 Astro 處理，直接複製到根目錄。
- **`/src`**: 原始碼目錄
  - **`/components`**: 通用 UI 元件 (如 `BaseHead.astro`, `Header.astro`, `Footer.astro`)。
  - **`/content`**: 內容集合 (Content Collections)。
    - **`/blog`**: 部落格文章存放處 (按年份資料夾分類，如 `2025/`)。
  - **`/layouts`**: 頁面佈局元件 (如 `MainLayout.astro`, `BlogPost.astro`)。
  - **`/pages`**: 頁面路由與進入點 (File-based Routing)。
    - **`rss.xml.js`**: RSS 生成邏輯。
  - **`/styles`**: 全域樣式 (如 `global.css`)。
  - **`consts.ts`**: 全域常數設定 (網站標題、描述等)。
  - **`content.config.ts`**: 定義 Content Collections 的 Schema。

---

## 3. 程式碼規範 (Coding Standards)

### A. Astro 元件 (.astro)

1. **Frontmatter**:

   - 必須使用 TypeScript。
   - 使用 `interface Props` 定義元件屬性，並支援型別檢查。
   - 邏輯程式碼寫在 `---` 分隔線內。

   ```astro
   ---
   interface Props {
     title: string;
     description?: string;
   }
   const { title, description } = Astro.props;
   ---
   ```

2. **Styling**:

- **優先使用 Tailwind CSS class**。
- 避免在 `.astro` 檔案中使用 `<style>` 標籤寫原生 CSS，除非是無法用 Tailwind 解決的特定樣式。

### B. 命名慣例 (Naming Conventions)

- **目錄 (Directories)**: `kebab-case` (例如 `node_modules`, `src`)
- **Astro 元件**: `PascalCase` (例如 `HeaderLink.astro`, `FormattedDate.astro`)
- **頁面 / 路由檔案**: `kebab-case` (例如 `about.astro`, `index.astro`)
- **變數 / 函式**: `camelCase`

### C. 內容管理 (Content Management)

- 新增部落格文章時，請放入 `src/content/blog/{YYYY}/{category}/` 目錄下。
- 必須包含完整的 Frontmatter (標題、日期、描述、圖片等)，以符合 `content.config.ts` 中的 Schema 定義。

---

## 4. 開發注意事項 (Important Rules)

1. **圖片引用**:

- 位於 `public` 的圖片，請使用絕對路徑引用 (例如 `/blog/cover.jpg`)。
- 位於 `src/assets` (若有) 的圖片，需使用 `import` 導入並交由 Astro Image 優化。

2. **連結處理**:

- 站內連結使用相對路徑或根路徑 `/`。
- 使用 `<HeaderLink />` 元件來處理導航列連結的 active 狀態。

3. **全域常數**:

- 網站標題、描述等共用資訊，請從 `src/consts.ts` 匯入，不要 Hardcode 字串。

4. **指令**:

- 所有指令 (npm run dev/build) 均在專案**根目錄**下執行。

5. Reason in **English**, but reply in **Traditional Chinese (zh-TW)**

6. Use Conventional Commits to commit your changes.