import type { Core } from '@strapi/strapi';

const LOCALE_NAMES: Record<string, string> = {
  'zh-Hans': 'Chinese (Simplified) (zh-Hans)',
  'zh-Hant': 'Chinese (Traditional) (zh-Hant)',
  en: 'English (en)',
  ja: 'Japanese (ja)',
  ko: 'Korean (ko)',
  fr: 'French (fr)',
  de: 'German (de)',
  es: 'Spanish (es)',
};

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

async function ensureLocales(strapi: Core.Strapi, locales: string[], defaultLocale: string) {
  try {
    const localesService = strapi.plugin('i18n')?.service('locales');

    for (const code of locales) {
      const existing = await strapi.db.query('plugin::i18n.locale').findOne({
        where: { code },
      });

      if (!existing) {
        const name = LOCALE_NAMES[code] || code;
        if (localesService?.create) {
          await localesService.create({ code, name });
        } else {
          await strapi.db.query('plugin::i18n.locale').create({
            data: { code, name },
          });
        }
        strapi.log.info(`[Bootstrap] Created i18n locale: ${code}`);
      }
    }

    if (localesService?.setDefaultLocale && defaultLocale) {
      const currentDefault = await localesService.getDefaultLocale?.();
      if (currentDefault !== defaultLocale) {
        await localesService.setDefaultLocale({ code: defaultLocale });
        strapi.log.info(`[Bootstrap] Set default i18n locale: ${defaultLocale}`);
      }
    }
  } catch (error) {
    strapi.log.warn(`[Bootstrap] Locale initialization warning: ${(error as Error).message}`);
  }
}

async function ensurePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    strapi.log.warn('[Bootstrap] Public role not found, skipping permission setup.');
    return;
  }

  const actionsToGrant = new Set<string>([
    'api::global.global.find',
    'api::site.site.find',
    'api::site.site.findOne',
    'api::article.article.find',
    'api::article.article.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
    'api::tag.tag.find',
    'api::tag.tag.findOne',
  ]);

  // Dynamically discover client-facing actions exposed by strapi-plugin-comments
  try {
    const usersPermissionsService = strapi.plugin('users-permissions')?.service('users-permissions');
    const allActions = await usersPermissionsService?.getActions?.();
    const commentsClient = allActions?.['plugin::comments']?.controllers?.client;

    if (commentsClient && typeof commentsClient === 'object') {
      for (const actionKey of Object.keys(commentsClient)) {
        actionsToGrant.add(`plugin::comments.client.${actionKey}`);
      }
    } else {
      for (const actionKey of ['findAllInHierarchy', 'findAllFlat', 'post', 'reportAbuse']) {
        actionsToGrant.add(`plugin::comments.client.${actionKey}`);
      }
    }
  } catch (error) {
    strapi.log.warn(`[Bootstrap] Could not inspect comments plugin actions: ${(error as Error).message}`);
  }

  for (const action of actionsToGrant) {
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: {
        action,
        role: publicRole.id,
      },
    });

    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: publicRole.id,
        },
      });
      strapi.log.info(`[Bootstrap] Granted public permission: ${action}`);
    }
  }
}

async function seedDemoData(strapi: Core.Strapi, locales: string[]) {
  const existingSites = await strapi.documents('api::site.site').findMany({
    limit: 1,
  });

  if (existingSites.length > 0) {
    return;
  }

  strapi.log.info('[Bootstrap] Seeding initial /life demo site and sample Markdown post...');

  const hasZh = locales.includes('zh-Hans');
  const hasEn = locales.includes('en');
  const primaryLocale = hasZh ? 'zh-Hans' : locales[0] || 'en';
  const defaultTheme = (process.env.DEFAULT_THEME || 'default').trim();
  const validTheme = ['default', 'warm', 'anime', 'cyber'].includes(defaultTheme)
    ? defaultTheme
    : 'default';

  // 1. Seed Global config
  const globalDoc = await strapi.documents('api::global.global').create({
    locale: primaryLocale,
    data: {
      portalTitle: primaryLocale === 'zh-Hans' ? '多站点博客空间' : 'Multi-Site Blog',
      portalSubtitle:
        primaryLocale === 'zh-Hans'
          ? '基于 Strapi v5 与 Next.js 构建的开箱即用多站点 Markdown 博客系统'
          : 'An out-of-the-box multi-site Markdown blog powered by Strapi v5 & Next.js',
      footerText: 'Powered by Strapi v5 & Next.js',
      defaultSiteSlug: process.env.DEFAULT_SITE_SLUG || '',
      defaultTheme: validTheme,
    },
  });

  if (hasZh && hasEn) {
    await strapi.documents('api::global.global').create({
      documentId: globalDoc.documentId,
      locale: 'en',
      data: {
        portalTitle: 'Multi-Site Blog',
        portalSubtitle: 'An out-of-the-box multi-site Markdown blog powered by Strapi v5 & Next.js',
        footerText: 'Powered by Strapi v5 & Next.js',
        defaultSiteSlug: process.env.DEFAULT_SITE_SLUG || '',
        defaultTheme: validTheme,
      },
    });
  }

  // 2. Seed single clean default Site: /life
  const lifeSite = await strapi.documents('api::site.site').create({
    locale: primaryLocale,
    data: {
      name: primaryLocale === 'zh-Hans' ? '生活手记' : 'Life Journal',
      slug: 'life',
      badge: primaryLocale === 'zh-Hans' ? '生活方式' : 'Lifestyle',
      tagline:
        primaryLocale === 'zh-Hans'
          ? '记录日常灵感、阅读随笔、旅行见闻与慢节奏思考'
          : 'Notes on everyday inspiration, reading essays, travel, and slow living',
      description:
        primaryLocale === 'zh-Hans'
          ? '这是默认初始化的示例博客站点（/life）。你可以在 Strapi 管理后台修改它的主题风格、名称，或继续创建更多独立的子站点。'
          : 'This is the default starter blog site (/life). Customize its theme and branding or add more sites anytime in Strapi Admin.',
      accentColor: '#f59e0b',
      theme: validTheme,
      sortOrder: 1,
      navLinks: [
        { label: primaryLocale === 'zh-Hans' ? '全部文章' : 'Posts', href: '/life', isExternal: false },
      ],
    },
  });
  await strapi.documents('api::site.site').publish({ documentId: lifeSite.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::site.site').create({
      documentId: lifeSite.documentId,
      locale: 'en',
      data: {
        name: 'Life Journal',
        slug: 'life',
        badge: 'Lifestyle',
        tagline: 'Notes on everyday inspiration, reading essays, travel, and slow living',
        description:
          'This is the default starter blog site (/life). Customize its theme and branding or add more sites anytime in Strapi Admin.',
        accentColor: '#f59e0b',
        theme: validTheme,
        sortOrder: 1,
        navLinks: [{ label: 'Posts', href: '/life', isExternal: false }],
      },
    });
    await strapi.documents('api::site.site').publish({ documentId: lifeSite.documentId, locale: 'en' });
  }

  // 3. Seed Category
  const lifeCat = await strapi.documents('api::category.category').create({
    locale: primaryLocale,
    data: {
      name: primaryLocale === 'zh-Hans' ? '日常随笔' : 'Essays',
      slug: 'essays',
      description: primaryLocale === 'zh-Hans' ? '生活记录、思考与分享' : 'Everyday stories & reflections',
      site: lifeSite.documentId,
    },
  });
  await strapi.documents('api::category.category').publish({ documentId: lifeCat.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::category.category').create({
      documentId: lifeCat.documentId,
      locale: 'en',
      data: {
        name: 'Essays',
        slug: 'essays',
        description: 'Everyday stories & reflections',
        site: lifeSite.documentId,
      },
    });
    await strapi.documents('api::category.category').publish({ documentId: lifeCat.documentId, locale: 'en' });
  }

  // 4. Seed Tag
  const tagGettingStarted = await strapi.documents('api::tag.tag').create({
    locale: primaryLocale,
    data: { name: primaryLocale === 'zh-Hans' ? '快速开始' : 'Getting Started', slug: 'getting-started' },
  });
  await strapi.documents('api::tag.tag').publish({
    documentId: tagGettingStarted.documentId,
    locale: primaryLocale,
  });

  if (hasZh && hasEn) {
    await strapi.documents('api::tag.tag').create({
      documentId: tagGettingStarted.documentId,
      locale: 'en',
      data: { name: 'Getting Started', slug: 'getting-started' },
    });
    await strapi.documents('api::tag.tag').publish({
      documentId: tagGettingStarted.documentId,
      locale: 'en',
    });
  }

  // 5. Seed generic Markdown Welcome Article
  const welcomeZh = `## 欢迎使用 Strapi Multi-Site Blog

恭喜！你的博客已经成功跑起来了。这是默认创建的示例站点 \`/life\`，你可以直接在 **Strapi 管理后台** 编辑或删除本篇文章，也可以新增更多独立站点（例如 \`/tech\`、\`/notes\`、\`/travel\` 等）。

### 快速上手清单

- [x] 通过 Docker Compose 一键启动 Nginx + Next.js + Strapi
- [ ] 进入 \`/admin\` 注册管理员账号，并在 **Site** 中切换喜欢的主题风格（\`default\` / \`warm\` / \`anime\` / \`cyber\`）
- [ ] 根据需要添加更多子站点、分类、标签与多语言内容
- [ ] 如需 AI 辅助写作，可在后台创建 Admin API Token 并接入 \`/mcp\`

### Markdown 能力演示

文章正文原生使用 **Markdown** 编写，支持 GFM 表格、数学公式与代码语法高亮：

\`\`\`yaml
site:
  slug: life
  theme: warm # 可选: default | warm | anime | cyber
  accentColor: "#f59e0b"
\`\`\`

| 内置主题 | 风格特点 | 适用场景 |
| :--- | :--- | :--- |
| \`default\` | 现代极简编辑风，清晰克制 | 通用博客、个人主页 |
| \`warm\` | 暖意纸感手帐，衬线标题与柔和圆角 | 生活随笔、读书笔记、咖啡日常 |
| \`anime\` | 樱花霓虹二次元手账，渐变光晕与描边卡片 | ACG 杂谈、游戏日志、创意记录 |
| \`cyber\` | 科技矩阵终端风，等宽元数据与霓虹高亮 | 技术专栏、开发笔记、极客实验 |

> 在页面底部可以看到内置的嵌套评论区；评论支持在 Strapi 后台集中管理与敏感词过滤。
`;

  const welcomeEn = `## Welcome to Strapi Multi-Site Blog

Your blog is up and running! This is the starter \`/life\` site. Feel free to edit or remove this sample post in **Strapi Admin**, switch themes, or create additional independent sub-blogs (such as \`/tech\`, \`/notes\`, or \`/travel\`).

### Quick Start Checklist

- [x] Boot Nginx + Next.js + Strapi with Docker Compose
- [ ] Sign in at \`/admin\` to create your admin account and pick a built-in theme (\`default\` / \`warm\` / \`anime\` / \`cyber\`) on any **Site**
- [ ] Add more sites, categories, tags, and multilingual entries
- [ ] Optionally generate an Admin API Token in Strapi to write posts via \`/mcp\`

### Markdown Showcase

Posts are written in native **Markdown** with GFM tables, KaTeX math, and syntax-highlighted code blocks:

\`\`\`yaml
site:
  slug: life
  theme: warm # Options: default | warm | anime | cyber
  accentColor: "#f59e0b"
\`\`\`

| Theme | Aesthetic | Best For |
| :--- | :--- | :--- |
| \`default\` | Clean Swiss-inspired editorial layout | General blogs & portfolios |
| \`warm\` | Cozy linen tones & serif headings | Lifestyle journals & essays |
| \`anime\` | Sakura-violet gradient & manga-style cards | ACG logs, gaming & creative notes |
| \`cyber\` | Matrix grid, monospace badges & neon accents | Engineering logs & tech sites |

> Scroll down to try the built-in nested comment section, managed directly inside Strapi Admin.
`;

  const welcomeArticle = await strapi.documents('api::article.article').create({
    locale: primaryLocale,
    data: {
      title:
        primaryLocale === 'zh-Hans'
          ? '欢迎使用：多站点 Markdown 博客快速指南'
          : 'Welcome: Quick Guide to Your Multi-Site Markdown Blog',
      slug: 'welcome-to-your-blog',
      summary:
        primaryLocale === 'zh-Hans'
          ? '了解如何在 Strapi 后台切换内置主题、创建多个子站点、使用 Markdown 写作与开启评论。'
          : 'Learn how to switch built-in themes, manage multiple sites, write in Markdown, and moderate comments.',
      content: primaryLocale === 'zh-Hans' ? welcomeZh : welcomeEn,
      authorName: 'Admin',
      publishedDate: new Date().toISOString().slice(0, 10),
      featured: true,
      allowComments: true,
      site: lifeSite.documentId,
      category: lifeCat.documentId,
      tags: [tagGettingStarted.documentId],
    },
  });
  await strapi
    .documents('api::article.article')
    .publish({ documentId: welcomeArticle.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::article.article').create({
      documentId: welcomeArticle.documentId,
      locale: 'en',
      data: {
        title: 'Welcome: Quick Guide to Your Multi-Site Markdown Blog',
        slug: 'welcome-to-your-blog',
        summary:
          'Learn how to switch built-in themes, manage multiple sites, write in Markdown, and moderate comments.',
        content: welcomeEn,
        authorName: 'Admin',
        publishedDate: new Date().toISOString().slice(0, 10),
        featured: true,
        allowComments: true,
        site: lifeSite.documentId,
        category: lifeCat.documentId,
        tags: [tagGettingStarted.documentId],
      },
    });
    await strapi.documents('api::article.article').publish({ documentId: welcomeArticle.documentId, locale: 'en' });
  }

  strapi.log.info('[Bootstrap] Demo content seeded successfully.');
}

async function disablePublicMembership(strapi: Core.Strapi) {
  try {
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    const advancedSettings = (await pluginStore.get({ key: 'advanced' })) as
      | Record<string, unknown>
      | null;

    if (advancedSettings && advancedSettings.allow_register !== false) {
      await pluginStore.set({
        key: 'advanced',
        value: {
          ...advancedSettings,
          allow_register: false,
        },
      });
      strapi.log.info('[Bootstrap] Disabled public user registration (allow_register=false).');
    }

    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (publicRole) {
      const authActions = [
        'plugin::users-permissions.auth.callback',
        'plugin::users-permissions.auth.connect',
        'plugin::users-permissions.auth.emailConfirmation',
        'plugin::users-permissions.auth.forgotPassword',
        'plugin::users-permissions.auth.register',
        'plugin::users-permissions.auth.resetPassword',
        'plugin::users-permissions.auth.sendEmailConfirmation',
      ];
      await strapi.db.query('plugin::users-permissions.permission').deleteMany({
        where: {
          role: publicRole.id,
          action: { $in: authActions },
        },
      });
    }
  } catch (error) {
    strapi.log.warn(`[Bootstrap] Membership lockdown warning: ${(error as Error).message}`);
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Hide end-user model from Content Manager (this blog has no reader membership UI;
    // users-permissions is retained only for Public API roles and strapi-plugin-comments).
    const endUserModel = strapi.contentType('plugin::users-permissions.user') as
      | { pluginOptions?: Record<string, Record<string, unknown>> }
      | undefined;
    if (endUserModel) {
      endUserModel.pluginOptions = {
        ...(endUserModel.pluginOptions || {}),
        'content-manager': {
          ...(endUserModel.pluginOptions?.['content-manager'] || {}),
          visible: false,
        },
        'content-type-builder': {
          ...(endUserModel.pluginOptions?.['content-type-builder'] || {}),
          visible: false,
        },
      };
    }

    const slugTargets = new Set([
      'api::article.article',
      'api::site.site',
      'api::category.category',
      'api::tag.tag',
    ]);

    strapi.documents.use(async (context, next) => {
      if (slugTargets.has(context.uid) && (context.action === 'create' || context.action === 'update')) {
        const data = context.params?.data as Record<string, unknown> | undefined;
        if (data && !data.slug) {
          const source = (data.title || data.name) as string | undefined;
          if (source) {
            data.slug = slugify(source);
          }
        }
      }
      return next();
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const supportedRaw = process.env.SUPPORTED_LOCALES || 'zh-Hans,en';
    const locales = supportedRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const defaultLocale = (process.env.DEFAULT_LOCALE || locales[0] || 'zh-Hans').trim();

    await ensureLocales(strapi, locales, defaultLocale);
    await ensurePublicPermissions(strapi);
    await disablePublicMembership(strapi);

    if ((process.env.SEED_DEMO_DATA ?? 'true').toLowerCase() === 'true') {
      await seedDemoData(strapi, locales);
    }
  },
};
