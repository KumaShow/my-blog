import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import { SLUG_PATTERN } from './utils/post-path';

/** tags 與 category slug 的格式：小寫英數字，連字號分隔 */
export { SLUG_PATTERN };

const blog = defineCollection({
  // 文章放在 src/content/blog/<category>/<slug>.md，category 由路徑第一段推導
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      title: z.string().min(1).max(200),
      description: z.string().min(10).max(300),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // public 絕對路徑，如 /blog/cover.jpg
      heroImage: z.string().startsWith('/').optional(),
      tags: z
        .array(
          z.string().regex(SLUG_PATTERN, 'tag 必須是 URL-safe 小寫 slug（如 nodejs、web-api）')
        )
        .default([])
        .refine((tags) => new Set(tags).size === tags.length, 'tags 不得重複'),
      // 系列內閱讀順序；未填者排在有 order 的文章之後（按日期新到舊）
      order: z.number().int().positive().optional(),
      draft: z.boolean().default(false),
    })
    .refine((data) => !data.updatedDate || data.updatedDate >= data.pubDate, {
      message: 'updatedDate 不可早於 pubDate',
    }),
});

const categories = defineCollection({
  // 一個分類一個 JSON，檔名即 category slug，須與 blog/ 第一層資料夾對應
  loader: glob({ base: './src/content/categories', pattern: '*.json' }),
  schema: z.object({
    label: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().int().positive().default(999),
  }),
});

export const collections = { blog, categories };
