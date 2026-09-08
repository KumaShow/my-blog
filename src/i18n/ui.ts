export const ui = {
  'zh-tw': {
    navigation: {
      home: '首頁',
      blog: '筆記',
      tags: 'Tags',
      about: '關於',
    },
    article: {
      lastUpdated: '最後更新於',
    },
    footer: {
      githubLink: '前往 StackAbyss 的 GitHub',
    },
    actions: {
      toggleTheme: '切換主題',
      openMenu: '開啟選單',
      closeMenu: '關閉選單',
      backHome: '返回首頁',
      goToNotes: '前往筆記',
      copy: '複製',
    },
    empty: {
      noPosts: '目前沒有文章。',
      categoryPreparing: '此系列籌備中',
      noTags: '目前沒有標籤。',
    },
    feedback: {
      copied: '已複製',
    },
  },
} as const;

export type UiLocale = keyof typeof ui;

export const defaultLocale: UiLocale = 'zh-tw';

export function getUi(locale: UiLocale = defaultLocale) {
  return ui[locale];
}
