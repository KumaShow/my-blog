---
title: 'Markdown 風格指南'
description: '這是一些在 Astro 中編寫 Markdown 內容時可以使用的基本 Markdown 語法範例。'
pubDate: '2025-12-17'
heroImage: '/blog/blog-placeholder-1.jpg'
---

這是一些在 Astro 中編寫 Markdown 內容時可以使用的基本 Markdown 語法範例。

## 標題

以下的 HTML `<h1>`—`<h6>` 元素代表六個級別的章節標題。`<h1>` 是最高層級，而 `<h6>` 是最低層級。

# H1

## H2

### H3

#### H4

##### H5

###### H6

## 段落

這是一段中文的假文（Lorem Ipsum）。它通常用於展示字體排版或版面設計的視覺效果，而不會讓人專注於實際的文字內容。這些文字沒有實際的意義，只是為了填滿空間，讓人們可以看到版面的整體樣貌。從古至今，排版師和設計師都習慣使用這種方式來測試版面的平衡感和可讀性。

當然，這段文字也可以用來測試中文字體的顯示效果。無論是宋體、黑體還是楷體，在不同的字重和大小下，都能呈現出不同的美感。在網頁設計中，確保文字在各種裝置上都能清晰易讀是非常重要的。

## 圖片

### 語法

```markdown
![Alt text](./full/or/relative/path/of/image)
```

### 輸出

![blog placeholder](/blog-placeholder-about.jpg)

## 引用區塊

引用區塊 (blockquote) 元素代表引用自其他來源的內容，可以選擇性地包含引文來源（必須在 `footer` 或 `cite` 元素內），以及選擇性地包含行內修改，如註釋和縮寫。

### 無來源的引用區塊

#### 語法

```markdown
> 這是一段引用的文字。
> **注意** 你可以在引用區塊中使用 _Markdown 語法_。
```

#### 輸出

> 這是一段引用的文字。
> **注意** 你可以在引用區塊中使用 _Markdown 語法_。

### 有來源的引用區塊

#### 語法

```markdown
> 不要通過共享記憶體來通訊，而要通過通訊來共享記憶體。<br>
> — <cite>Rob Pike[^1]</cite>
```

#### 輸出

> 不要通過共享記憶體來通訊，而要通過通訊來共享記憶體。<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: 以上引用摘自 Rob Pike 在 2015 年 11 月 18 日 Gopherfest 期間的 [演講](https://www.youtube.com/watch?v=PAAkCSZUG1c)。

## 表格

### 語法

```markdown
| 斜體      | 粗體     | 程式碼 |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |
```

### 輸出

| 斜體      | 粗體     | 程式碼 |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |

## 程式碼區塊

### 語法

我們可以在新的一行使用 3 個反引號 \`\`\`，寫下程式碼片段，然後在新的一行用 3 個反引號結束。為了高亮顯示特定語言的語法，可以在最初的 3 個反引號後寫下語言名稱，例如 html, javascript, css, markdown, typescript, txt, bash。

````markdown
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```
````

### 輸出

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```

## 列表類型

### 有序列表

#### 語法

```markdown
1. 第一項
2. 第二項
3. 第三項
```

#### 輸出

1. 第一項
2. 第二項
3. 第三項

### 無序列表

#### 語法

```markdown
- 列表項目
- 另一項
- 還有另一項
```

#### 輸出

- 列表項目
- 另一項
- 還有另一項

### 巢狀列表

#### 語法

```markdown
- 水果
  - 蘋果
  - 橘子
  - 香蕉
- 乳製品
  - 牛奶
  - 起司
```

#### 輸出

- 水果
  - 蘋果
  - 橘子
  - 香蕉
- 乳製品
  - 牛奶
  - 起司

## 其他元素 — abbr, sub, sup, kbd, mark

### 語法

```markdown
<abbr title="Graphics Interchange Format">GIF</abbr> 是一種點陣圖圖像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按下 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> 來結束工作階段。

大多數<mark>蠑螈</mark>是夜行性的，並捕食昆蟲、蠕蟲和其他小生物。
```

### 輸出

<abbr title="Graphics Interchange Format">GIF</abbr> 是一種點陣圖圖像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按下 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> 來結束工作階段。

大多數<mark>蠑螈</mark>是夜行性的，並捕食昆蟲、蠕蟲和其他小生物。
