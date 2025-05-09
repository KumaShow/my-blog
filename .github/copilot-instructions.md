# 個人 Astro 部落格專案 - 開發規格書

**版本:** 1.0
**日期:** 2025-04-07

## 1. 專案概觀 (Project Overview)

本文件旨在定義使用 Astro、Tailwind CSS、TypeScript 技術棧，並透過 GitHub 與 Cloudflare Pages/DNS 進行版本控制、部署與管理的個人部落格專案的開發規格。此部落格旨在提供一個高效能、易於維護、開發體驗良好的個人內容發布平台。

## 2. 專案目標 (Project Goals)

*   **建立一個現代化的個人部落格網站：** 分享技術文章、個人心得、學習筆記等內容。
*   **高效能：** 利用 Astro 的靜態優先 (Static-First) 特性，達成快速的頁面載入速度與優異的 Lighthouse 分數。
*   **優良的開發體驗：** 借助 Astro 的簡潔語法、Vite 的快速 HMR、TypeScript 的類型安全以及 Tailwind CSS 的高效樣式開發。
*   **易於內容創作與管理：** 使用 Markdown/MDX 格式撰寫文章，流程簡單直觀。
*   **響應式設計：** 確保在各種裝置（桌面、平板、手機）上皆有良好的閱讀體驗。
*   **SEO 友善：** 實作基本的 SEO 優化，提升網站在搜尋引擎的可見度。
*   **自動化部署：** 透過 GitHub Push 觸發 Cloudflare Pages 自動建置與部署。

## 3. 技術架構 (Technical Stack)

*   **主要框架 (Framework):** [Astro](https://astro.build/) - 用於建構內容驅動型網站的現代靜態網站產生器。
*   **樣式方案 (Styling):** [Tailwind CSS](https://tailwindcss.com/) - 一個 Utility-First 的 CSS 框架，用於快速建構自訂設計。
*   **程式語言 (Language):** [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，提供靜態類型檢查。
*   **建置工具 (Build Tool):** [Vite](https://vitejs.dev/) - Astro 底層使用的建置工具，提供極速的開發伺服器啟動與熱模組替換 (HMR)。
*   **套件管理器 (Package Manager):** npm
*   **版本控制 (Version Control):** Git / [GitHub](https://github.com/) - 用於程式碼託管、版本管理與協作。
*   **部署平台 (Deployment):** [Cloudflare Pages](https://pages.cloudflare.com/) - 提供靜態網站的全球 CDN 部署、CI/CD。
*   **DNS 管理 (DNS Management):** [Cloudflare DNS](https://www.cloudflare.com/dns/) - 管理網域名稱解析。
*   **內容格式 (Content Format):** Markdown (`.md`) / MDX (`.mdx`) - 用於撰寫部落格文章。

## 4. 專案結構 (Project Structure)

採用 Astro 專案的標準結構：
```
├── public/ # 存放靜態資源 (favicon, robots.txt, images)
├── src/
│ ├── components/ # 可重用的 Astro/UI 框架元件 (e.g., Header, Footer, Card)
│ ├── content/ # Astro 內容集合 (Content Collections)
│ │ ├── blog/ # 部落格文章 (Markdown/MDX)
│ │ └── config.ts # 內容集合的 Schema 定義 (使用 Zod)
│ ├── layouts/ # 頁面佈局元件 (e.g., BaseLayout.astro)
│ ├── pages/ # 頁面路由 (e.g., index.astro, about.astro)
│ │ └── rss.xml.js # RSS Feed 生成路由
│ │ └── posts/
│ │ └── [slug].astro # 部落格文章詳情頁動態路由
│ ├── styles/ # 全域 CSS 樣式 (e.g., global.css, 包含 Tailwind 的樣式)
│ └── env.d.ts # TypeScript 環境定義
├── .github/
| ├── copilot/ # (可選) GitHub Copilot 設定
│ └── workflows/ # (可選) GitHub Actions 工作流程 (若需更複雜 CI)
├── .gitignore
├── .prettierrc # (建議) Prettier 格式化設定
├── .eslint.config.js # (建議) ESLint 檢查設定
├── astro.config.mjs # Astro 主要設定檔 (整合 Tailwind, Sitemap 等)
├── package.json
└── tsconfig.json # TypeScript 設定檔
```

## 5. 核心功能 (Core Features)

*   **首頁 (Homepage):**
    *   顯示最新或精選的部落格文章列表 (標題、日期、摘要、標籤)。
    *   可能包含簡短的個人介紹或導覽。
*   **文章列表頁 (Blog Index Page):**
    *   分頁顯示所有部落格文章。
    *   提供依標籤 (Tags) 或分類 (Categories) 篩選的功能 (可選)。
*   **文章詳情頁 (Blog Post Page):**
    *   顯示完整的文章內容 (Markdown/MDX 渲染)。
    *   包含文章標題、發布日期、作者 (若適用)、標籤。
    *   程式碼區塊語法高亮。
    *   (可選) 相關文章推薦：基於相同的標籤 (tags) 或分類 (category) 進行推薦。
    *   (可選) 社群分享按鈕。
*   **內容管理 (Content Management):**
    *   使用 `src/content/blog/` 目錄存放 `.md` 或 `.mdx` 文件。
    *   每篇文章包含 Frontmatter (YAML 格式) 定義元數據 (例如 `title`, `pubDate`, `description`, `tags`, `image`, `draft` 狀態等)。
    *   使用 Astro Content Collections (`src/content/config.ts`) 搭配 Zod 定義並驗證 Frontmatter Schema，確保內容的型別安全。
*   **佈局 (Layouts):**
    *   `BaseLayout.astro`: 包含通用的頁面結構 (HTML head, header, footer, 全域樣式)。
    *   `PostLayout.astro`: 用於文章詳情頁的特定佈局。
*   **響應式設計 (Responsive Design):**
    *   使用 Tailwind CSS 的響應式斷點工具 (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) 確保跨裝置的視覺一致性與可用性。
*   **SEO 優化 (SEO Optimization):**
    *   自動產生 `<title>` 和 `<meta name="description">` (基於 Frontmatter)。
    *   自動產生 Open Graph 標籤 (用於社群媒體分享預覽)。
    *   透過 `@astrojs/sitemap` 整合自動產生 `sitemap.xml`。
    *   語意化的 HTML 標籤。
*   **RSS Feed:**
    *   提供 `rss.xml` 路由，讓讀者可以訂閱更新。
*   **(可選) 關於頁面 (About Page):**
    *   介紹部落格作者或網站本身。
*   **(可選) 標籤/分類頁面 (Tag/Category Pages):**
    *   顯示特定標籤或分類下的所有文章列表。

## 6. 設計與樣式 (Design & Styling)

*   **主要工具:** Tailwind CSS（^4.1.3）。
*   **設定檔:** 使用 @theme 指令於 `global.css` 定義主題 (顏色、字體、間距等)與自訂。
*   **全域樣式:** 基礎樣式、字體載入等可放在 `src/styles/global.css` 中，並在 `BaseLayout.astro` 引入。
*   **元件樣式:** 主要透過在 Astro 或 UI 框架元件的 `class` 屬性中直接應用 Tailwind Utility Classes。避免濫用 `@apply`。
*   **字體:** 選擇合適的網頁字體，並在 Tailwind 設定檔或全域 CSS 中配置。
*   **深色模式 (Dark Mode):** 透過 Tailwind 的 `dark:` variant 實作，並使用 localStorage 儲存使用者偏好。

## 7. 開發工作流程 (Development Workflow)

1.  **環境設定:**
    *   安裝 Node.js (建議使用 LTS 版本)。
    *   Clone GitHub 儲存庫。
    *   執行 `npm install` (或 `yarn install`, `pnpm install`) 安裝依賴。
2.  **本地開發:**
    *   執行 `npm run dev` 啟動 Astro 開發伺服器 (由 Vite 提供支援)。
    *   瀏覽 `http://localhost:4321` (預設端口)。
    *   享受快速的熱模組替換 (HMR)。
3.  **程式碼品質:**
    *   (建議) 設定 Prettier 進行程式碼自動格式化。
    *   (建議) 設定 ESLint 進行程式碼風格和潛在錯誤檢查。
    *   在 `package.json` 中加入 `lint` 和 `format` 的 scripts。
    *   考慮使用 `husky` 和 `lint-staged` 在 commit 前自動執行檢查和格式化。
4.  **分支策略 (Branching Strategy)**
    *   **`main` 分支:**
        *   **用途:** 代表穩定、已部署到生產環境 (Cloudflare Pages) 的程式碼。
        *   **來源:** 只能從 `develop` 分支 (或緊急修復的 `hotfix` 分支) 合併而來。
        *   **限制:** 禁止直接向 `main` 分支提交程式碼 (Commit)。所有變更必須透過合併請求 (Pull Request) 進行。
        *   **部署:** 推送 (Push) 到 `main` 分支會觸發 Cloudflare Pages 的生產環境部署。
        *   **標籤 (Tag):** 在每次合併到 `main` 後，應打上對應的版本號標籤 (e.g., `v1.0.0`, `v1.1.0`)。

    *   **`develop` 分支:**
        *   **用途:** 主要的開發整合分支，匯集所有已完成的功能開發和錯誤修復，代表下一個版本的最新開發狀態。
        *   **來源:** 從 `main` 分支初始化。接收來自 `feature/*` 和 `hotfix/*` 分支的合併。
        *   **限制:** 不建議直接向 `develop` 分支提交日常開發程式碼，應使用功能分支。
        *   **部署 (可選):** 可以設定 Cloudflare Pages 為 `develop` 分支建立預覽或測試環境部署。

    *   **功能分支 (Feature Branches):**
        *   **命名:** `feature/<feature-name>` (例如: `feature/add-search`, `feature/new-layout`)。
        *   **用途:** 開發新功能或進行較大的重構。
        *   **來源:** 從 `develop` 分支建立。
        *   **合併目標:** 完成開發並經過基本測試後，透過 Pull Request (PR) 合併回 `develop` 分支。合併後可刪除此分支。

    *   **修復分支 (Bugfix Branches):**
        *   **命名:** `fix/<issue-description>` (例如: `fix/header-alignment`, `fix/rss-feed-error`)。
        *   **用途:** 修復在 `develop` 分支上發現的非緊急 Bug。
        *   **來源:** 從 `develop` 分支建立。
        *   **合併目標:** 修復完成後，透過 Pull Request (PR) 合併回 `develop` 分支。合併後可刪除此分支。

    *   **緊急修復分支 (Hotfix Branches):**
        *   **命名:** `hotfix/<fix-description>` (例如: `hotfix/critical-security-patch`, `hotfix/fix-production-crash`)。
        *   **用途:** 修復生產環境 (`main` 分支) 上發現的緊急 Bug。
        *   **來源:** 直接從 `main` 分支的最新 Tag 或 Commit 建立。
        *   **合併目標:**
            1.  修復完成並測試後，透過 Pull Request (PR) **首先合併回 `main` 分支**，並打上新的修補版本標籤 (e.g., `v1.0.1`)。
            2.  **同時，必須將此 `hotfix` 分支合併回 `develop` 分支**，以確保修復也被納入後續的開發版本中。
            3.  合併完成後可刪除此分支。
5.  **內容創作:**
    *   在 `src/content/blog/` 目錄下新增或修改 Markdown/MDX 文件。
    *   遵循 `src/content/config.ts` 中定義的 Frontmatter Schema。
    *   Commit 並 Push 到 GitHub。

## 8. 測試策略 (Testing Strategy)

*   **靜態檢查:** TypeScript 型別檢查、ESLint 語法檢查、Prettier 格式檢查。
*   **手動測試:**
    *   在不同瀏覽器 (Chrome, Firefox, Safari) 上進行測試。
    *   在不同螢幕尺寸或使用瀏覽器開發者工具模擬裝置進行響應式測試。
    *   檢查核心功能是否正常運作 (頁面導覽、文章顯示、連結點擊等)。
*   **自動化測試 (可選，視複雜度增加):**
    *   **單元測試 (Unit Testing):** 對於獨立的 TypeScript 工具函數或複雜元件邏輯，可使用 Vitest 等工具編寫單元測試。
    *   **端對端測試 (E2E Testing):** 使用 Playwright 或 Cypress 驗證關鍵使用者流程 (例如：訪問首頁 -> 點擊文章 -> 驗證文章內容)。

## 9. 部署流程 (Deployment Pipeline)

1.  **平台:** Cloudflare Pages。
2.  **觸發方式:** 當程式碼 Push 到 GitHub 儲存庫的 `main` 分支時自動觸發。
3.  **設定:**
    *   在 Cloudflare Pages 連接 GitHub 儲存庫。
    *   **建置指令 (Build command):** `npm run build` (或 `yarn build`, `pnpm build`)。 Astro 的預設建置指令是 `astro build`，但通常 `npm run build` 會被定義為執行 `astro build`。
    *   **建置輸出目錄 (Build output directory):** `dist` (Astro 的預設輸出目錄)。
    *   **環境變數 (Environment variables):** (若有需要) 在 Cloudflare Pages UI 中設定，例如 Google Analytics ID 等。
4.  **自訂網域:**
    *   在 Cloudflare DNS 中設定好您的網域名稱。
    *   在 Cloudflare Pages 設定中綁定您的自訂網域。Cloudflare 會自動處理 SSL/TLS 憑證。
5.  **預覽部署 (Preview Deployments):** Cloudflare Pages 會自動為每個 Pull Request 建立預覽部署，方便在合併前審查變更。

## 10. 未來考量與擴充 (Future Considerations & Roadmap)

*   **進階 SEO:** 結構化資料 (Schema.org)、更細緻的 meta 標籤管理。
*   **圖片優化:** 使用 Astro Assets (`@astrojs/image`) 進行自動圖片優化和轉換 (AVIF/WebP)。
*   **搜尋功能:** 整合頁面內搜尋或使用 Algolia 等外部服務。
*   **評論系統:** 嵌入如 Giscus, Utterances 或其他第三方評論服務。
*   **分析整合:** 整合 Google Analytics, Plausible Analytics 或 Cloudflare Web Analytics。
*   **國際化 (i18n):** 若有需要，提供多語言支援。
*   **PWA (Progressive Web App):** 增加離線存取、推播通知等功能。
*   **Web Vitals 持續監控:** 定期檢查並優化 Core Web Vitals 指標。