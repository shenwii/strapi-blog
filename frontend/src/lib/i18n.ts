import { getDefaultLocale, getSupportedLocales } from './env';

export interface Dictionary {
  home: string;
  allSites: string;
  allPosts: string;
  featured: string;
  categories: string;
  tags: string;
  searchPlaceholder: string;
  searchButton: string;
  searchResultsFor: string;
  noArticles: string;
  noArticlesDesc: string;
  readMore: string;
  minRead: string;
  toc: string;
  backToBlog: string;
  prevPost: string;
  nextPost: string;
  rssFeed: string;
  commentsTitle: string;
  commentsEmpty: string;
  commentName: string;
  commentEmail: string;
  commentBody: string;
  commentSubmit: string;
  commentSubmitting: string;
  commentReply: string;
  commentCancelReply: string;
  commentReplyingTo: string;
  commentPendingApproval: string;
  commentSuccess: string;
  commentError: string;
  fallbackNotice: string;
  enterSite: string;
  pagePrev: string;
  pageNext: string;
  switchTheme: string;
  switchLanguage: string;
  postsCount: string;
}

const zhHans: Dictionary = {
  home: '首页',
  allSites: '全部站点',
  allPosts: '全部文章',
  featured: '精选推荐',
  categories: '分类',
  tags: '标签',
  searchPlaceholder: '搜索文章标题、摘要或正文…',
  searchButton: '搜索',
  searchResultsFor: '搜索结果',
  noArticles: '暂无文章',
  noArticlesDesc: '当前栏目或筛选条件下还没有已发布的文章，你可以在 Strapi 后台或通过 MCP 发布第一篇 Markdown 文章。',
  readMore: '阅读全文',
  minRead: '分钟阅读',
  toc: '文章目录',
  backToBlog: '返回专栏',
  prevPost: '上一篇',
  nextPost: '下一篇',
  rssFeed: 'RSS 订阅',
  commentsTitle: '评论交流',
  commentsEmpty: '还没有评论，来抢第一个沙发吧。',
  commentName: '昵称',
  commentEmail: '邮箱（选填，不公开）',
  commentBody: '写下你的想法…（支持纯文本）',
  commentSubmit: '发表评论',
  commentSubmitting: '提交中…',
  commentReply: '回复',
  commentCancelReply: '取消回复',
  commentReplyingTo: '正在回复',
  commentPendingApproval: '评论已提交，等待管理员审核后展示。',
  commentSuccess: '评论发表成功！',
  commentError: '评论提交失败，请稍后重试。',
  fallbackNotice: '当前文章尚未提供所选语言的译文，以下展示默认语言版本。',
  enterSite: '进入专栏',
  pagePrev: '上一页',
  pageNext: '下一页',
  switchTheme: '切换明暗主题',
  switchLanguage: '切换语言',
  postsCount: '篇文章',
};

const en: Dictionary = {
  home: 'Home',
  allSites: 'All Blogs',
  allPosts: 'All Posts',
  featured: 'Featured',
  categories: 'Categories',
  tags: 'Tags',
  searchPlaceholder: 'Search articles, summaries, or markdown…',
  searchButton: 'Search',
  searchResultsFor: 'Search results for',
  noArticles: 'No articles yet',
  noArticlesDesc: 'There are no published posts matching this filter yet. Publish your first Markdown post via Strapi Admin or MCP.',
  readMore: 'Read article',
  minRead: 'min read',
  toc: 'On this page',
  backToBlog: 'Back to blog',
  prevPost: 'Previous',
  nextPost: 'Next',
  rssFeed: 'RSS Feed',
  commentsTitle: 'Comments',
  commentsEmpty: 'No comments yet. Be the first to share your thoughts.',
  commentName: 'Name',
  commentEmail: 'Email (optional, kept private)',
  commentBody: 'Write a comment…',
  commentSubmit: 'Post Comment',
  commentSubmitting: 'Posting…',
  commentReply: 'Reply',
  commentCancelReply: 'Cancel',
  commentReplyingTo: 'Replying to',
  commentPendingApproval: 'Comment submitted and awaiting moderation.',
  commentSuccess: 'Comment posted!',
  commentError: 'Failed to post comment. Please try again.',
  fallbackNotice: 'This post is not yet translated into the current language. Showing the default version.',
  enterSite: 'Visit Blog',
  pagePrev: 'Previous',
  pageNext: 'Next',
  switchTheme: 'Toggle color mode',
  switchLanguage: 'Switch language',
  postsCount: 'posts',
};

const DICTIONARIES: Record<string, Dictionary> = {
  'zh-Hans': zhHans,
  zh: zhHans,
  en,
};

export function normalizeLocale(input?: string): string {
  const supported = getSupportedLocales();
  const def = getDefaultLocale();
  if (!input) return def;
  if (supported.includes(input)) return input;
  if (input.toLowerCase() === 'zh' && supported.includes('zh-Hans')) return 'zh-Hans';
  const match = supported.find((loc) => loc.toLowerCase() === input.toLowerCase());
  return match || def;
}

export function getDictionary(locale: string): Dictionary {
  return DICTIONARIES[locale] || DICTIONARIES[locale.split('-')[0]] || en;
}

export function getLocaleLabel(locale: string): string {
  const labels: Record<string, string> = {
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
    en: 'English',
    ja: '日本語',
  };
  return labels[locale] || locale;
}

export function buildHref(locale: string, path: string): string {
  const defaultLocale = getDefaultLocale();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) {
    return normalizedPath;
  }
  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function formatDate(dateStr: string | undefined | null, locale: string): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
