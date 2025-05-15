import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.string().transform(str => new Date(str)),
    lastMod: z.string().optional().transform(str => 
      str ? new Date(str) : undefined
    ),
    summary: z.string(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    sticky: z.number().default(0),
  })
});

export const collections = {
  'blog': blogCollection,
};

/* 
  Astro Frontmatter 範例 test：
  ---
  title: "Astro 個人部落格開發心得"
  date: "2025-05-09"
  lastMod: "2025-05-09"
  summary: "這篇文章分享我用 Astro 建立個人部落格的經驗與技巧。"
  category: "開發筆記"
  tags:
    - Astro
    - 部落格
    - 前端
  image: "/images/astro-blog-cover.png"
  draft: false
  sticky: 1
  ---

  注意事項：
  - title、date、summary 是必填欄位。
  - date 與 lastMod 請填寫 ISO 格式日期字串（如 2025-05-09）。
  - tags 是字串陣列，可選填。
  - draft 預設為 false，如需隱藏文章可設為 true。
  - 其他欄位如 category、image、sticky 皆為可選。 
*/