#!/usr/bin/env node

/**
 * new-post.mjs – 快速建立部落格文章的 helper script
 *
 * 文章路徑：src/content/blog/<category>/<slug>.md（category 由路徑決定，不寫入 frontmatter）
 * 分類必須先存在 src/content/categories/<category>.json，否則直接失敗。
 *
 * Usage:
 *   npm run new-post -- --title "文章標題" --category nodejs
 *   npm run new-post -- --title "NodeJS｜全域物件與執行環境" --category nodejs --tags nodejs,runtime --order 1
 *   node scripts/new-post.mjs "文章標題"            # 互動式詢問缺少的欄位
 *
 * Options:
 *   --title <text>        文章標題（必填，未提供時互動詢問）
 *   --category <slug>     分類（必填，未提供時互動詢問；須已存在對應 JSON）
 *   --slug <slug>         自訂 slug（預設由標題產生）
 *   --tags a,b,c          逗號分隔的 tags（小寫 slug 格式）
 *   --order <n>           系列內閱讀順序（正整數）
 *   --description <text>  文章描述（預設同標題）
 *   --hero-image <path>   封面圖（public 絕對路徑）
 *   --draft / --no-draft  是否為草稿（預設 --draft）
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Portable ESM __dirname: works on Node 18+ without import.meta.dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

const BLOG_ROOT = resolve(join(__dirname, '..', 'src', 'content', 'blog'));
const CATEGORIES_ROOT = resolve(join(__dirname, '..', 'src', 'content', 'categories'));
const DEFAULT_HERO_IMAGE = '/blog/blog-placeholder-1.jpg';

// 與 src/content.config.ts 的 SLUG_PATTERN 一致
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Reasonable length limits
const MAX_TITLE_LEN = 200;
const MAX_SLUG_LEN = 100;
const MAX_CATEGORY_LEN = 60;
const MIN_DESCRIPTION_LEN = 10;
const MAX_DESCRIPTION_LEN = 300;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Prompt the user for input via stdin.
 * 非互動環境（stdin 已關閉 / EOF）時 resolve 空字串，讓呼叫端以「空值」錯誤退出，
 * 避免 promise 永不 resolve 導致程序默默以 exit 0 結束。
 */
function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    let answered = false;
    rl.question(question, (answer) => {
      answered = true;
      rl.close();
      resolve(answer.trim());
    });
    rl.on('close', () => {
      if (!answered) resolve('');
    });
  });
}

/** Turn a title string into a URL-friendly slug. */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_]+/g, '-') // spaces / underscores → hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

function hasPathSeparators(value) {
  return /[\\/]/.test(value);
}

function hasDotSegments(value) {
  return /(^|[\\/])\.\.([\\/]|$)/.test(value);
}

/**
 * Sanitize a user-provided slug.
 * Reject obvious path traversal attempts, then normalize to a safe slug.
 */
function sanitizeSlug(raw) {
  const value = raw.trim();
  if (!value) return '';
  if (hasPathSeparators(value) || hasDotSegments(value)) {
    throw new Error('Slug 不能包含路徑分隔符或 ".."。');
  }
  const s = slugify(value);
  if (s.length > MAX_SLUG_LEN) return s.slice(0, MAX_SLUG_LEN).replace(/-+$/, '');
  return s;
}

/**
 * Sanitize a category to a safe single path segment.
 * Rejects anything containing path separators or dot-sequences.
 */
function sanitizeCategory(raw) {
  const value = raw.trim();
  if (!value) return '';
  if (hasPathSeparators(value) || hasDotSegments(value)) {
    throw new Error('分類不能包含路徑分隔符或 ".."。');
  }

  const normalized = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '') // only allow safe chars
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (normalized.length > MAX_CATEGORY_LEN)
    return normalized.slice(0, MAX_CATEGORY_LEN).replace(/-+$/, '');
  return normalized;
}

/**
 * Assert that the resolved target path stays inside the allowed root.
 * Throws if the path would escape BLOG_ROOT.
 */
function assertInsideRoot(target, root) {
  const resolvedTarget = resolve(target);
  const resolvedRoot = resolve(root);
  // resolvedRoot must be a prefix followed by a separator (or be equal)
  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + sep)) {
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

/** Escape a value for a single-quoted YAML string. */
function yamlQuote(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // --- CLI Args Parsing ---
  const args = process.argv.slice(2);
  let title = '';
  let slug = '';
  let category = '';
  let description = '';
  let heroImage = '';
  let tagsInput = '';
  let orderInput = '';
  let draft = true; // 新文章預設為草稿

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--slug') slug = args[++i]?.trim() ?? '';
    else if (arg === '--category') category = args[++i]?.trim() ?? '';
    else if (arg === '--description') description = args[++i]?.trim() ?? '';
    else if (arg === '--hero-image') heroImage = args[++i]?.trim() ?? '';
    else if (arg === '--title') title = args[++i]?.trim() ?? '';
    else if (arg === '--tags') tagsInput = args[++i]?.trim() ?? '';
    else if (arg === '--order') orderInput = args[++i]?.trim() ?? '';
    else if (arg === '--draft') draft = true;
    else if (arg === '--no-draft') draft = false;
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

  // 2. Resolve category — must already exist in src/content/categories/
  //    （先檢查分類再處理 slug，讓「分類不存在」能及早失敗）
  if (!category) {
    category = await prompt('請輸入分類 (category slug，如 nodejs): ');
  }
  category = sanitizeCategory(category);
  if (!category || !SLUG_PATTERN.test(category)) {
    console.error('❌ 分類名稱無效，請使用小寫英文字母、數字和連字號。');
    process.exit(1);
  }
  const categoryFile = join(CATEGORIES_ROOT, `${category}.json`);
  assertInsideRoot(categoryFile, CATEGORIES_ROOT);
  if (!existsSync(categoryFile)) {
    console.error(
      `❌ 分類 "${category}" 不存在，請先建立 src/content/categories/${category}.json\n` +
        `   （欄位：label、description、icon、order，範本見 docs/blog-design-plan.md §3.3）`
    );
    process.exit(1);
  }

  // 3. Resolve slug — always sanitize even when user-provided
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

  // 4. Parse tags — must match SLUG_PATTERN, no duplicates
  const tags = tagsInput
    ? tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  for (const tag of tags) {
    if (!SLUG_PATTERN.test(tag)) {
      console.error(`❌ tag "${tag}" 格式無效，必須是小寫 slug（如 nodejs、web-api）。`);
      process.exit(1);
    }
  }
  if (new Set(tags).size !== tags.length) {
    console.error('❌ tags 不得重複。');
    process.exit(1);
  }

  // 5. Parse order — positive integer if provided
  let order;
  if (orderInput) {
    order = Number(orderInput);
    if (!Number.isInteger(order) || order <= 0) {
      console.error('❌ order 必須是正整數。');
      process.exit(1);
    }
  }

  // 6. Determine file path & guard against path traversal
  const dir = join(BLOG_ROOT, category);
  const filePath = join(dir, `${slug}.md`);
  try {
    assertInsideRoot(dir, BLOG_ROOT);
    assertInsideRoot(filePath, BLOG_ROOT);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }

  // 7. Build file content
  if (!description) description = title;
  if (description.length < MIN_DESCRIPTION_LEN) {
    console.error(`❌ 描述至少需 ${MIN_DESCRIPTION_LEN} 字元（schema 限制），請用 --description 提供。`);
    process.exit(1);
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    description = description.slice(0, MAX_DESCRIPTION_LEN);
  }
  if (!heroImage) heroImage = DEFAULT_HERO_IMAGE;
  if (!heroImage.startsWith('/')) {
    console.error('❌ hero image 必須是 public 絕對路徑（以 / 開頭，如 /blog/cover.jpg）。');
    process.exit(1);
  }

  const frontmatter = [
    '---',
    `title: ${yamlQuote(title)}`,
    `description: ${yamlQuote(description)}`,
    `pubDate: ${yamlQuote(today())}`,
    `heroImage: ${yamlQuote(heroImage)}`,
    `tags: [${tags.map(yamlQuote).join(', ')}]`,
    ...(order !== undefined ? [`order: ${order}`] : []),
    `draft: ${draft}`,
    '---',
  ].join('\n');

  const content = `${frontmatter}

## ${title}

在這裡開始撰寫你的文章...
`;

  // 8. Write file atomically using flag 'wx': fails if file already exists,
  //    eliminating the TOCTOU race between existsSync + writeFileSync.
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
  if (draft) {
    console.log('   （預設為草稿 draft: true，發布前請改為 false 或移除該欄位）');
  }
}

main().catch((err) => {
  console.error('❌ 發生錯誤：', err.message);
  process.exit(1);
});
