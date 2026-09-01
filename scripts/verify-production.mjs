#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = join(projectRoot, 'dist');
const publishedPost = 'demo/first-post';
const draftPosts = ['demo/markdown-style-guide', 'demo/using-mdx'];

function readOutput(relativePath) {
  const filePath = join(distRoot, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`找不到 production 輸出：${relativePath}。請先執行 npm run build。`);
  }
  return readFileSync(filePath, 'utf8');
}

function assertIncludes(content, expected, description) {
  if (!content.includes(expected)) {
    throw new Error(`production 輸出缺少${description}：${expected}`);
  }
}

function assertExcludes(content, unexpected, description) {
  if (content.includes(unexpected)) {
    throw new Error(`production 輸出不應包含${description}：${unexpected}`);
  }
}

if (!existsSync(distRoot)) {
  throw new Error('找不到 dist/。請先執行 npm run build。');
}

const publishedHtml = readOutput(`blog/${publishedPost}/index.html`);
const rss = readOutput('rss.xml');
const sitemap = readOutput('sitemap-0.xml');
const publishedPath = `/blog/${publishedPost}/`;

assertIncludes(publishedHtml, '第一篇測試文章', 'published 文章頁');
assertIncludes(rss, publishedPath, 'RSS published item');
assertIncludes(sitemap, publishedPath, 'sitemap published entry');

for (const draftPost of draftPosts) {
  const draftHtmlPath = join(distRoot, 'blog', draftPost, 'index.html');
  if (existsSync(draftHtmlPath)) {
    throw new Error(`draft 不應產生文章頁：${draftHtmlPath}`);
  }
  const draftPath = `/blog/${draftPost}/`;
  assertExcludes(rss, draftPath, 'RSS draft item');
  assertExcludes(sitemap, draftPath, 'sitemap draft entry');
}

console.log('✅ production HTML、RSS 與 sitemap 已驗證 published／draft 規則。');
