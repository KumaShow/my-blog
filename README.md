# 技術深淵 (Tech Abyss)

[![CI](https://github.com/KumaShow/my-blog/actions/workflows/ci.yml/badge.svg)](https://github.com/KumaShow/my-blog/actions/workflows/ci.yml)

![Project Banner](public/blog-placeholder-about.jpg)

HI！我是 Benson，一名前端工程師，這裡是我的個人技術筆記。用於紀錄學習過程中的一些技術文章、筆記、心得等。本專案使用 Astro 框架建置。

## 🛠️ 技術堆疊

本部落格採用以下技術構建：

-   **核心框架**: [Astro 5](https://astro.build/) - 以內容為中心的網頁框架，效能極佳。
-   **樣式**: [Tailwind CSS 4](https://tailwindcss.com/) - 實用優先的 CSS 框架。
-   **內容管理**: MDX & Markdown - 支援在 Markdown 中使用元件。
-   **整合工具**:
    -   `@astrojs/sitemap`: 自動生成網站地圖。
    -   `@astrojs/rss`: 生成 RSS 訂閱源。
    -   `@astrojs/partytown`: 將第三方腳本移至 Web Worker 執行。

## 📂 專案結構

```text
├── public/       # 靜態資源（圖片、字型等）
├── src/
│   ├── components/ # 通用元件
│   ├── content/    # 內容集合（部落格文章等）
│   ├── layouts/    # 頁面佈局
│   ├── pages/      # 頁面路由與進入點
│   ├── styles/     # 全域樣式
│   └── consts.ts   # 全域常數設定
└── astro.config.mjs # Astro 設定檔
```

## 🧞‍♂️ 常用指令

所有指令皆在專案根目錄下執行：

| 指令 | 說明 |
| :--- | :--- |
| `npm run dev` | 啟動本機開發伺服器 (預設於 `localhost:4321`) |
| `npm run build` | 建置生產環境版本至 `./dist/` |
| `npm run preview` | 在本機預覽建置後的版本 |
| `npm run lint` | 執行 ESLint 檢查程式碼品質 |
| `npm run format` | 使用 Prettier 格式化程式碼 |

## 📝 開發筆記

-   文章位於 `src/content/blog/` 目錄下。
-   全域資訊（標題、描述）可於 `src/consts.ts` 中修改。
-   本專案已配置路徑別名（Aliases），例如 `@components` 指向 `src/components`。

## 授權

本專案基於 Astro Blog Starter 修改。
