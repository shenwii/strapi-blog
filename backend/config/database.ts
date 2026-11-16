import path from 'path';
import type { Core } from '@strapi/strapi';

export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections: Record<string, any> = {
    sqlite: {
      connection: {
        filename: path.resolve(
          __dirname,
          '..',
          '..',
          env('DATABASE_FILENAME', '/app/data/data.db')
        ),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'postgres'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi_blog'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        schema: env('DATABASE_SCHEMA', 'public'),
        ssl: env.bool('DATABASE_SSL', false)
          ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) }
          : false,
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
    },
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'mysql'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi_blog'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        charset: 'utf8mb4',
        ssl: env.bool('DATABASE_SSL', false)
          ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) }
          : false,
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
    },
  };

  const selectedConnection = connections[client];

  if (!selectedConnection) {
    throw new Error(`Unsupported DATABASE_CLIENT: "${client}". Expected sqlite, postgres, or mysql.`);
  }

  return {
    connection: {
      client,
      ...selectedConnection,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
