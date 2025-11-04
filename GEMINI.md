
# 專案概觀

這是一個使用 [Astro](https://astro.build/) 網站框架建立的部落格專案。它基於 "blog" 入門套件範本。

## 主要技術

*   **框架：** Astro
*   **樣式：** Tailwind CSS
*   **內容：** Markdown (MD) 和 MDX
*   **程式碼檢查：** ESLint
*   **格式化：** Prettier

## 專案結構

*   `src/pages`：包含部落格的頁面。此目錄中的每個 `.astro` 或 `.md` 檔案都會成為網站上的一個頁面。
*   `src/components`：包含可重複使用的 Astro 元件。
*   `src/layouts`：包含定義頁面結構的版面配置元件。
*   `src/content`：包含內容集合，例如部落格文章。
*   `public`：包含圖片和字型等靜態資產。

## 建置與執行

`package.json` 中提供下列腳本：

*   `npm run dev`：啟動本機開發伺服器。
*   `npm run build`：建置用於生產環境的網站。
*   `npm run preview`：在本機預覽生產環境組建。
*   `npm run lint`：對程式碼庫執行程式碼檢查以找出錯誤。
*   `npm run format`：使用 Prettier 格式化程式碼。

## 開發慣例

*   本專案使用 [Tailwind CSS](https://tailwindcss.com/) 設定樣式。
*   部落格文章以 Markdown 或 MDX 撰寫，並位於 `src/content/blog` 目錄中。
*   本專案使用 ESLint 進行程式碼檢查，並使用 Prettier 進行程式碼格式化。建議在提交變更之前執行 `npm run lint` 和 `npm run format`。
