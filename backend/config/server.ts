import type { Core } from '@strapi/strapi';

export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => {
  const publicUrl = env('PUBLIC_SITE_URL');

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    ...(publicUrl ? { url: publicUrl } : {}),
    proxy: env.bool('STRAPI_PROXY', true),
    app: {
      keys: env.array('APP_KEYS'),
    },
    mcp: {
      enabled: env.bool('STRAPI_MCP_ENABLED', true),
    },
  };
};
