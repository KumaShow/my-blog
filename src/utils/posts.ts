/**
 * 文章資料存取層。
 *
 * 所有頁面（含 RSS、sitemap、tags、上下篇導覽）一律透過這裡取文章，
 * 禁止直接呼叫 getCollection('blog')，確保 draft 過濾與排序規則只實作一次。
 * 規則定義見 docs/blog-design-plan.md §3.4、§3.5。
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { assertBlogPostPath } from './post-path';

export type BlogPost = CollectionEntry<'blog'>;
export type Category = CollectionEntry<'categories'>;

/** 由文章 id（路徑）推導 category：路徑第一段為唯一真相來源 */
export function getCategoryOf(post: BlogPost): string {
  return assertBlogPostPath(post.id).category;
}

/**
 * 一致性驗證：每篇文章必須位於分類資料夾內，
 * 且該資料夾必須有對應的 src/content/categories/<name>.json，否則讓 build 失敗。
 */
export async function assertCategoriesConsistency(posts?: BlogPost[]): Promise<void> {
  const allPosts = posts ?? (await getCollection('blog'));
  const known = new Set((await getCollection('categories')).map((c) => c.id));

  for (const post of allPosts) {
    const { category } = assertBlogPostPath(post.id);
    if (!known.has(category)) {
      throw new Error(
        `文章 "${post.id}" 的分類 "${category}" 沒有對應的 metadata，` +
          `請建立 src/content/categories/${category}.json（範本見 docs/blog-design-plan.md §3.3）。`
      );
    }
  }
}

/**
 * 取得可發布文章。
 * dev 環境包含草稿（UI 應加草稿標示）；production 排除草稿。
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  await assertCategoriesConsistency(posts);
  return import.meta.env.DEV ? posts : posts.filter((post) => !post.data.draft);
}

/**
 * 系列內排序（docs/blog-design-plan.md §3.5）：
 * 1. 有 order 者在前，order 由小到大；同 order 按 pubDate 舊到新，再按 id 字典序。
 * 2. 無 order 者在後，按 pubDate 新到舊，再按 id 字典序。
 */
export function sortPostsInCategory(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const aOrder = a.data.order;
    const bOrder = b.data.order;

    if (aOrder !== undefined && bOrder !== undefined) {
      if (aOrder !== bOrder) return aOrder - bOrder;
      const byDate = a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
      if (byDate !== 0) return byDate;
      return a.id.localeCompare(b.id);
    }
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;

    const byDate = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}

/** 取得某分類的可發布文章，已依系列內規則排序 */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return sortPostsInCategory(posts.filter((post) => getCategoryOf(post) === category));
}

/** 上一篇／下一篇：沿同分類的系列排序序列取前後篇 */
export async function getAdjacentPosts(
  post: BlogPost
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  const posts = await getPostsByCategory(getCategoryOf(post));
  const index = posts.findIndex((p) => p.id === post.id);
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}

/** 全站 tag 統計（tag → 文章數），已排除草稿 */
export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  const tags = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  return tags;
}
