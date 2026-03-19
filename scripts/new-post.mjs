#!/usr/bin/env node

/**
 * new-post.mjs – 快速建立部落格文章的 helper script
 *
 * Usage:
 *   npm run new-post -- "文章標題"
 *   node scripts/new-post.mjs "文章標題"
 *   node scripts/new-post.mjs --title "文章標題" --slug my-slug --year 2025 --category dev
 *
 * 若未提供標題，會以互動式 prompt 要求輸入。
 */

import { mkdirSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Portable ESM __dirname: works on Node 18+ without import.meta.dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

const BLOG_ROOT = resolve(join(__dirname, '..', 'src', 'content', 'blog'));
const DEFAULT_HERO_IMAGE = '/blog/blog-placeholder-1.jpg';
const DEFAULT_CATEGORY = 'uncategorized';

// Reasonable length limits
const MAX_TITLE_LEN = 200;
const MAX_SLUG_LEN = 100;
const MAX_CATEGORY_LEN = 60;
const MAX_DESCRIPTION_LEN = 300;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Prompt the user for input via stdin. */
function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Turn a title string into a URL-friendly slug. */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^\w\s-]/g, '')        // remove non-word chars
    .replace(/[\s_]+/g, '-')         // spaces / underscores → hyphens
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}

/**
 * Sanitize a user-provided slug: always run through slugify to strip any
 * dangerous characters, then enforce the length limit.
 */
function sanitizeSlug(raw) {
  const s = slugify(raw);
  if (s.length > MAX_SLUG_LEN) return s.slice(0, MAX_SLUG_LEN).replace(/-+$/, '');
  return s;
}

/**
 * Sanitize a category to a safe single path segment.
 * Only allows lowercase letters, digits, and hyphens.
 * Rejects anything containing path separators or dot-sequences.
 */
function sanitizeCategory(raw) {
  const normalized = raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')  // only allow safe chars
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (normalized.length > MAX_CATEGORY_LEN) return normalized.slice(0, MAX_CATEGORY_LEN).replace(/-+$/, '');
  return normalized;
}

/**
 * Detect the latest year folder inside BLOG_ROOT.
 * If none exists, returns the current year as a string.
 */
function getLatestYear() {
  if (!existsSync(BLOG_ROOT)) {
    return String(new Date().getFullYear());
  }

  const years = readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{4}$/.test(d.name))
    .map((d) => d.name)
    .sort();

  return years.length > 0 ? years[years.length - 1] : String(new Date().getFullYear());
}

/**
 * Assert that the resolved target path stays inside the allowed root.
 * Throws if the path would escape BLOG_ROOT.
 */
function assertInsideRoot(target, root) {
  const resolvedTarget = resolve(target);
  const resolvedRoot = resolve(root);
  // resolvedRoot must be a prefix followed by a separator (or be equal)
  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + '/')) {
    throw new Error(`路徑逸出限制目錄：${resolvedTarget}`);
  }
}

/** Format today's date as YYYY-MM-DD. */
function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // --- CLI Args Parsing ---
  // 支援參數: --slug, --year, --category, --description, --hero-image, --title
  const args = process.argv.slice(2);
  let title = '';
  let slug = '';
  let year = '';
  let category = '';
  let description = '';
  let heroImage = '';
  // 簡單參數解析 (僅 Node 內建)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--slug') slug = args[++i]?.trim() ?? '';
    else if (arg === '--year') year = args[++i]?.trim() ?? '';
    else if (arg === '--category') category = args[++i]?.trim() ?? '';
    else if (arg === '--description') description = args[++i]?.trim() ?? '';
    else if (arg === '--hero-image') heroImage = args[++i]?.trim() ?? '';
    else if (arg === '--title') title = args[++i]?.trim() ?? '';
    else if (!arg.startsWith('--') && !title) title = arg.trim();
  }

  // 1. Resolve title
  if (!title) {
    title = await prompt('請輸入文章標題 (Post title): ');
  }
  if (!title) {
    console.error('❌ 標題不可為空。');
    process.exit(1);
  }
  if (title.length > MAX_TITLE_LEN) {
    console.error(`❌ 標題過長，請限制在 ${MAX_TITLE_LEN} 字元以內。`);
    process.exit(1);
  }

  // 2. Resolve slug — always sanitize even when user-provided
  if (slug) {
    slug = sanitizeSlug(slug);
  }
  if (!slug) slug = sanitizeSlug(title);
  if (!slug) {
    const raw = await prompt('無法自動產生 slug，請手動輸入 (slug): ');
    slug = sanitizeSlug(raw);
  }
  if (!slug) {
    console.error('❌ Slug 不可為空。');
    process.exit(1);
  }

  // 3. Determine year
  if (!year) year = getLatestYear();
  if (!/^[0-9]{4}$/.test(year)) {
    console.error('❌ 年份格式錯誤，請輸入 4 位數年份 (YYYY)。');
    process.exit(1);
  }

  // 4. Determine category — sanitize to a safe single path segment
  if (category) {
    category = sanitizeCategory(category);
    if (!category) {
      console.error('❌ 分類名稱包含無效字元，請使用英文字母、數字和連字號。');
      process.exit(1);
    }
  } else {
    category = DEFAULT_CATEGORY;
  }

  // 5. Determine file path & guard against path traversal
  const dir = join(BLOG_ROOT, year, category);
  const filePath = join(dir, `${slug}.md`);
  try {
    assertInsideRoot(dir, BLOG_ROOT);
    assertInsideRoot(filePath, BLOG_ROOT);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }

  // 6. Build file content
  const pubDate = today();
  if (!description) description = title;
  if (description.length > MAX_DESCRIPTION_LEN) {
    description = description.slice(0, MAX_DESCRIPTION_LEN);
  }
  if (!heroImage) heroImage = DEFAULT_HERO_IMAGE;
  const content = `---
title: '${title.replace(/'/g, "''")}'
description: '${description.replace(/'/g, "''")}'
pubDate: '${pubDate}'
heroImage: '${heroImage}'
---

## ${title}

在這裡開始撰寫你的文章...
`;

  // 7. Write file atomically using flag 'wx': fails if file already exists,
  //    eliminating the TOCTOU race between the old existsSync + writeFileSync.
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(filePath, content, { encoding: 'utf-8', flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.error(`❌ 檔案已存在：${filePath}`);
    } else {
      console.error(`❌ 寫入失敗：${err.message}`);
    }
    process.exit(1);
  }

  console.log(`✅ 文章已建立：${filePath}`);
}

main().catch((err) => {
  console.error('❌ 發生錯誤：', err.message);
  process.exit(1);
});
