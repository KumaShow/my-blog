/** 文章 category、slug 與文章 id 共用的 URL-safe 路徑規則。 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BLOG_POST_ID_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

export interface BlogPostPath {
  category: string;
  slug: string;
}

/** 解析並驗證 Astro content entry 的 category/slug 兩層 id。 */
export function parseBlogPostPath(id: string): BlogPostPath | null {
  const match = BLOG_POST_ID_PATTERN.exec(id);
  if (!match) return null;

  return { category: match[1], slug: match[2] };
}

/**
 * 驗證文章必須嚴格位於 src/content/blog/<category>/<slug>.md（或 .mdx）。
 * Astro loader 會將副檔名移除，因此這裡驗證的是 entry id。
 */
export function assertBlogPostPath(id: string): BlogPostPath {
  const path = parseBlogPostPath(id);
  if (!path) {
    throw new Error(
      `文章 "${id}" 的路徑格式無效：必須嚴格符合 ` +
        `src/content/blog/<category>/<slug>.md（或 .mdx），` +
        `category 與 slug 只能使用小寫英數字及連字號，` +
        `例如 src/content/blog/demo/first-post.md。`
    );
  }
  return path;
}
