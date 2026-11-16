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
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
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
      // Fallback common action names for strapi-plugin-comments v3
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

  strapi.log.info('[Bootstrap] Seeding initial demo sites, categories, tags, and Markdown posts...');

  const hasZh = locales.includes('zh-Hans');
  const hasEn = locales.includes('en');
  const primaryLocale = hasZh ? 'zh-Hans' : locales[0] || 'en';

  // 1. Seed Global config
  const globalDoc = await strapi.documents('api::global.global').create({
    locale: primaryLocale,
    data: {
      portalTitle: primaryLocale === 'zh-Hans' ? '多站点博客矩阵' : 'Multi-Site Blog Hub',
      portalSubtitle:
        primaryLocale === 'zh-Hans'
          ? '基于 Strapi v5 与 Next.js 构建的开箱即用多站点 Markdown 博客系统'
          : 'An out-of-the-box multi-site Markdown blog powered by Strapi v5 & Next.js',
      footerText: 'Powered by Strapi v5 & Next.js',
      defaultSiteSlug: process.env.DEFAULT_SITE_SLUG || '',
    },
  });

  if (hasZh && hasEn) {
    await strapi.documents('api::global.global').create({
      documentId: globalDoc.documentId,
      locale: 'en',
      data: {
        portalTitle: 'Multi-Site Blog Hub',
        portalSubtitle: 'An out-of-the-box multi-site Markdown blog powered by Strapi v5 & Next.js',
        footerText: 'Powered by Strapi v5 & Next.js',
        defaultSiteSlug: process.env.DEFAULT_SITE_SLUG || '',
      },
    });
  }

  // 2. Seed Sites: /home-assistant & /life
  const haSite = await strapi.documents('api::site.site').create({
    locale: primaryLocale,
    data: {
      name: primaryLocale === 'zh-Hans' ? 'Home Assistant 实验室' : 'Home Assistant Lab',
      slug: 'home-assistant',
      badge: primaryLocale === 'zh-Hans' ? '智能家居' : 'Smart Home',
      tagline:
        primaryLocale === 'zh-Hans'
          ? '自动化脚本、Zigbee / ESPHome 硬件折腾与全屋智能实战'
          : 'Automations, Zigbee, ESPHome hardware tinkering & smart home guides',
      description:
        primaryLocale === 'zh-Hans'
          ? '专注于 Home Assistant 家庭自动化平台的技术专栏，分享实用的 YAML 配置、设备接入方案与本地化隐私玩法。'
          : 'Dedicated to Home Assistant local-first home automation, practical YAML blueprints, and sensor DIY.',
      accentColor: '#0ea5e9',
      sortOrder: 1,
      navLinks: [
        { label: primaryLocale === 'zh-Hans' ? '全部文章' : 'Posts', href: '/home-assistant', isExternal: false },
        { label: primaryLocale === 'zh-Hans' ? '生活手记' : 'Life Journal', href: '/life', isExternal: false },
      ],
    },
  });
  await strapi.documents('api::site.site').publish({ documentId: haSite.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::site.site').create({
      documentId: haSite.documentId,
      locale: 'en',
      data: {
        name: 'Home Assistant Lab',
        slug: 'home-assistant',
        badge: 'Smart Home',
        tagline: 'Automations, Zigbee, ESPHome hardware tinkering & smart home guides',
        description:
          'Dedicated to Home Assistant local-first home automation, practical YAML blueprints, and sensor DIY.',
        accentColor: '#0ea5e9',
        sortOrder: 1,
        navLinks: [
          { label: 'Posts', href: '/home-assistant', isExternal: false },
          { label: 'Life Journal', href: '/life', isExternal: false },
        ],
      },
    });
    await strapi.documents('api::site.site').publish({ documentId: haSite.documentId, locale: 'en' });
  }

  const lifeSite = await strapi.documents('api::site.site').create({
    locale: primaryLocale,
    data: {
      name: primaryLocale === 'zh-Hans' ? '生活手记' : 'Life Journal',
      slug: 'life',
      badge: primaryLocale === 'zh-Hans' ? '生活方式' : 'Lifestyle',
      tagline:
        primaryLocale === 'zh-Hans'
          ? '咖啡、旅行、摄影与日常思考的慢节奏空间'
          : 'Slow notes on coffee, travel, photography, and everyday reflections',
      description:
        primaryLocale === 'zh-Hans'
          ? '脱离代码与硬件的日常随笔，记录城市漫步、手冲咖啡风味笔记与阅读感悟。'
          : 'Personal essays away from code—capturing city walks, pour-over coffee logs, and book reflections.',
      accentColor: '#f59e0b',
      sortOrder: 2,
      navLinks: [
        { label: primaryLocale === 'zh-Hans' ? '随笔目录' : 'Essays', href: '/life', isExternal: false },
        { label: 'Home Assistant', href: '/home-assistant', isExternal: false },
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
        tagline: 'Slow notes on coffee, travel, photography, and everyday reflections',
        description:
          'Personal essays away from code—capturing city walks, pour-over coffee logs, and book reflections.',
        accentColor: '#f59e0b',
        sortOrder: 2,
        navLinks: [
          { label: 'Essays', href: '/life', isExternal: false },
          { label: 'Home Assistant', href: '/home-assistant', isExternal: false },
        ],
      },
    });
    await strapi.documents('api::site.site').publish({ documentId: lifeSite.documentId, locale: 'en' });
  }

  // 3. Seed Categories
  const haCat = await strapi.documents('api::category.category').create({
    locale: primaryLocale,
    data: {
      name: primaryLocale === 'zh-Hans' ? '自动化实战' : 'Automations',
      slug: 'automations',
      description:
        primaryLocale === 'zh-Hans' ? 'Home Assistant YAML 自动化与场景联动' : 'YAML automations & smart scenes',
      site: haSite.documentId,
    },
  });
  await strapi.documents('api::category.category').publish({ documentId: haCat.documentId, locale: primaryLocale });

  const lifeCat = await strapi.documents('api::category.category').create({
    locale: primaryLocale,
    data: {
      name: primaryLocale === 'zh-Hans' ? '日常随笔' : 'Essays',
      slug: 'essays',
      description: primaryLocale === 'zh-Hans' ? '生活中的小确幸与思考' : 'Everyday stories & thoughts',
      site: lifeSite.documentId,
    },
  });
  await strapi.documents('api::category.category').publish({ documentId: lifeCat.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::category.category').create({
      documentId: haCat.documentId,
      locale: 'en',
      data: {
        name: 'Automations',
        slug: 'automations',
        description: 'YAML automations & smart scenes',
        site: haSite.documentId,
      },
    });
    await strapi.documents('api::category.category').publish({ documentId: haCat.documentId, locale: 'en' });

    await strapi.documents('api::category.category').create({
      documentId: lifeCat.documentId,
      locale: 'en',
      data: {
        name: 'Essays',
        slug: 'essays',
        description: 'Everyday stories & thoughts',
        site: lifeSite.documentId,
      },
    });
    await strapi.documents('api::category.category').publish({ documentId: lifeCat.documentId, locale: 'en' });
  }

  // 4. Seed Tags
  const tagHa = await strapi.documents('api::tag.tag').create({
    locale: primaryLocale,
    data: { name: 'Home Assistant', slug: 'home-assistant' },
  });
  await strapi.documents('api::tag.tag').publish({ documentId: tagHa.documentId, locale: primaryLocale });

  const tagCoffee = await strapi.documents('api::tag.tag').create({
    locale: primaryLocale,
    data: { name: primaryLocale === 'zh-Hans' ? '手冲咖啡' : 'Coffee', slug: 'coffee' },
  });
  await strapi.documents('api::tag.tag').publish({ documentId: tagCoffee.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::tag.tag').create({
      documentId: tagHa.documentId,
      locale: 'en',
      data: { name: 'Home Assistant', slug: 'home-assistant' },
    });
    await strapi.documents('api::tag.tag').publish({ documentId: tagHa.documentId, locale: 'en' });

    await strapi.documents('api::tag.tag').create({
      documentId: tagCoffee.documentId,
      locale: 'en',
      data: { name: 'Coffee', slug: 'coffee' },
    });
    await strapi.documents('api::tag.tag').publish({ documentId: tagCoffee.documentId, locale: 'en' });
  }

  // 5. Seed Sample Markdown Articles
  const haArticleZh = `## 为什么选择本地化智能家居？

把传感器的每一条状态都交给云端，不仅会有延迟，还可能因为断网导致全屋自动化瘫痪。使用 **Home Assistant** 搭配 Zigbee2MQTT，所有控制指令都在局域网内毫秒级响应。

### 核心联动 YAML 示例

下面是一个根据人体存在传感器与光照度自动开灯的示例：

\`\`\`yaml
alias: "客厅夜间自动补光"
description: "有人移动且照度低于 30 lx 时开启氛围灯"
trigger:
  - platform: state
    entity_id: binary_sensor.living_room_presence
    to: "on"
condition:
  - condition: numeric_state
    entity_id: sensor.living_room_illuminance
    below: 30
action:
  - service: light.turn_on
    target:
      entity_id: light.living_room_ambient
    data:
      brightness_pct: 45
      kelvin: 3200
mode: single
\`\`\`

### 推荐硬件清单

| 设备类型 | 通信协议 | 推荐理由 |
| :--- | :--- | :--- |
| 毫米波存在传感器 | Zigbee / Wi-Fi | 静止人体也能稳定识别 |
| 智能墙壁开关（零火） | Zigbee 3.0 | 兼作路由中继，网络更稳定 |
| USB 温湿度计 | ESPHome (BLE) | 成本极低，刷机即可接入 |

> 提示：你可以通过 Strapi 内置的 **MCP Server** 让 AI 助手直接帮你生成并发布新的自动化教程文章。
`;

  const haArticleEn = `## Why Local-First Smart Home Matters

Relying on cloud servers for every motion event adds latency and breaks automations when your ISP goes down. With **Home Assistant** and Zigbee2MQTT, every rule executes locally in milliseconds.

### Sample Automation YAML

Here is a practical blueprint combining mmWave presence detection with ambient lux levels:

\`\`\`yaml
alias: "Living Room Evening Ambient Light"
description: "Turn on ambient lighting when occupied and dark"
trigger:
  - platform: state
    entity_id: binary_sensor.living_room_presence
    to: "on"
condition:
  - condition: numeric_state
    entity_id: sensor.living_room_illuminance
    below: 30
action:
  - service: light.turn_on
    target:
      entity_id: light.living_room_ambient
    data:
      brightness_pct: 45
      kelvin: 3200
mode: single
\`\`\`

### Recommended Hardware Matrix

| Device | Protocol | Why It Works |
| :--- | :--- | :--- |
| mmWave Presence Sensor | Zigbee / Wi-Fi | Detects stationary occupants reliably |
| Neutral Wall Switch | Zigbee 3.0 | Acts as a mesh router for stability |
| BLE Hygrometer | ESPHome | Low cost and easy local flashing |

> Tip: Strapi v5 ships with a built-in **MCP Server** so your AI coding assistant can draft and publish Markdown guides directly.
`;

  const haArticle = await strapi.documents('api::article.article').create({
    locale: primaryLocale,
    data: {
      title:
        primaryLocale === 'zh-Hans'
          ? '从零搭建高稳定本地化 Home Assistant 自动化体系'
          : 'Building a Rock-Solid Local Home Assistant Automation Setup',
      slug: 'local-home-assistant-automation-guide',
      summary:
        primaryLocale === 'zh-Hans'
          ? '如何结合毫米波雷达、Zigbee2MQTT 与 YAML Blueprint 打造断网也能毫秒级响应的智能家居。'
          : 'Combine mmWave sensors, Zigbee2MQTT, and YAML blueprints for millisecond local smart home control.',
      content: primaryLocale === 'zh-Hans' ? haArticleZh : haArticleEn,
      authorName: 'Wei',
      publishedDate: new Date().toISOString().slice(0, 10),
      featured: true,
      allowComments: true,
      site: haSite.documentId,
      category: haCat.documentId,
      tags: [tagHa.documentId],
    },
  });
  await strapi.documents('api::article.article').publish({ documentId: haArticle.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::article.article').create({
      documentId: haArticle.documentId,
      locale: 'en',
      data: {
        title: 'Building a Rock-Solid Local Home Assistant Automation Setup',
        slug: 'local-home-assistant-automation-guide',
        summary: 'Combine mmWave sensors, Zigbee2MQTT, and YAML blueprints for millisecond local smart home control.',
        content: haArticleEn,
        authorName: 'Wei',
        publishedDate: new Date().toISOString().slice(0, 10),
        featured: true,
        allowComments: true,
        site: haSite.documentId,
        category: haCat.documentId,
        tags: [tagHa.documentId],
      },
    });
    await strapi.documents('api::article.article').publish({ documentId: haArticle.documentId, locale: 'en' });
  }

  const lifeArticleZh = `## 清晨十分钟的手冲仪式

工作再忙，每天早晨给自己留出十分钟研磨、注水、闻香，依然是一天中最治愈的锚点。

### 本周豆单记录：耶加雪菲 · 水洗

* **粉水比**：1 : 15（15g 粉 / 225g 水）
* **水温**：91°C
* **三段式注水**：
  1. 闷蒸 35g，静待 30 秒
  2. 中心绕圈注水至 140g
  3. 尾段柔水注至 225g，总时长约 2 分 05 秒

> 柑橘的明亮酸质在降温后逐渐转为蜂蜜般的甜感，非常适合作为秋日清晨的第一杯。

### 写在最后

这个博客空间与 \`/home-assistant\` 技术站完全分离，用来存放所有非技术向的日常记录。你可以在下方留言区分享你最近喝到最喜欢的豆子。
`;

  const lifeArticleEn = `## A Quiet Ten-Minute Pour-Over Ritual

No matter how busy the week gets, taking ten slow minutes to grind beans, bloom, and pour remains the calmest anchor of my morning.

### This Week's Bean: Washed Yirgacheffe

* **Ratio**: 1 : 15 (15g coffee / 225g water)
* **Water Temp**: 91°C
* **Pour Schedule**:
  1. Bloom with 35g for 30 seconds
  2. Steady spiral pour up to 140g
  3. Gentle finish to 225g, total brew ~2m 05s

> Bright citrus notes soften into honey-like sweetness as the cup cools—an ideal autumn morning companion.

### Closing Note

This \`/life\` blog is completely separate from \`/home-assistant\`, giving everyday essays their own calm home. Feel free to leave a comment below!
`;

  const lifeArticle = await strapi.documents('api::article.article').create({
    locale: primaryLocale,
    data: {
      title:
        primaryLocale === 'zh-Hans'
          ? '秋日清晨的一杯水洗耶加雪菲：我的 1:15 手冲笔记'
          : 'Morning Washed Yirgacheffe: My 1:15 Pour-Over Notes',
      slug: 'morning-yirgacheffe-pour-over-notes',
      summary:
        primaryLocale === 'zh-Hans'
          ? '记录一周的粉水比实验与风味变化，在快节奏里留出安静的十分钟。'
          : 'Logging brew ratios, water temperatures, and tasting notes for a calmer start to the day.',
      content: primaryLocale === 'zh-Hans' ? lifeArticleZh : lifeArticleEn,
      authorName: 'Wei',
      publishedDate: new Date().toISOString().slice(0, 10),
      featured: true,
      allowComments: true,
      site: lifeSite.documentId,
      category: lifeCat.documentId,
      tags: [tagCoffee.documentId],
    },
  });
  await strapi.documents('api::article.article').publish({ documentId: lifeArticle.documentId, locale: primaryLocale });

  if (hasZh && hasEn) {
    await strapi.documents('api::article.article').create({
      documentId: lifeArticle.documentId,
      locale: 'en',
      data: {
        title: 'Morning Washed Yirgacheffe: My 1:15 Pour-Over Notes',
        slug: 'morning-yirgacheffe-pour-over-notes',
        summary: 'Logging brew ratios, water temperatures, and tasting notes for a calmer start to the day.',
        content: lifeArticleEn,
        authorName: 'Wei',
        publishedDate: new Date().toISOString().slice(0, 10),
        featured: true,
        allowComments: true,
        site: lifeSite.documentId,
        category: lifeCat.documentId,
        tags: [tagCoffee.documentId],
      },
    });
    await strapi.documents('api::article.article').publish({ documentId: lifeArticle.documentId, locale: 'en' });
  }

  strapi.log.info('[Bootstrap] Demo content seeded successfully.');
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Auto-fill slug from title/name when creating entries via Admin or MCP if slug is omitted
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

    if ((process.env.SEED_DEMO_DATA ?? 'true').toLowerCase() === 'true') {
      await seedDemoData(strapi, locales);
    }
  },
};
