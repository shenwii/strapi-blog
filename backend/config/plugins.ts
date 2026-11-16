import type { Core } from '@strapi/strapi';

export default ({ env }: Core.Config.Shared.ConfigParams) => {
  const requireApproval = env.bool('COMMENTS_REQUIRE_APPROVAL', false);

  return {
    'users-permissions': {
      config: {
        jwtSecret: env('JWT_SECRET'),
      },
    },
    comments: {
      enabled: true,
      config: {
        badWords: true,
        moderatorRoles: ['Authenticated'],
        approvalFlow: requireApproval ? ['api::article.article'] : [],
        entryLabel: {
          '*': ['title', 'name', 'slug'],
          'api::article.article': ['title', 'slug'],
        },
        enabledCollections: ['api::article.article'],
        reportReasons: {
          MY_CUSTOM_REASON: 'MY_CUSTOM_REASON',
        },
      },
    },
  };
};
