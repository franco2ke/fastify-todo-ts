import fastifyPostgres, { type PostgresPluginOptions } from '@fastify/postgres';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

interface PluginOptions extends FastifyPluginOptions {
  postgres: PostgresPluginOptions;
}

interface DatabaseInfo {
  database_name: string;
  username: string;
  version: string;
  current_time: Date;
}

async function postgres(fastify: FastifyInstance, opts: PluginOptions) {
  try {
    // Add pg namespace to Fastify instance, which avails postgres features
    await fastify.register(fastifyPostgres, opts.postgres);

    // Test connection with database info query
    const client = await fastify.pg.connect();
    const result = await client.query<DatabaseInfo>(`SELECT 
        current_database() as database_name,
        current_user as username,
        version() as version,
        NOW() as current_time`);

    client.release();
    const dbInfo = result.rows[0];

    fastify.log.info(
      {
        database: 'PostgreSQL',
        status: 'connected',
        databaseName: dbInfo.database_name,
        username: dbInfo.username,
        version: dbInfo.version.split(' ').slice(0, 2).join(' '),
        currentTime: dbInfo.current_time,
      },
      'PostgreSQL connection was successful',
    );
  } catch (error) {
    fastify.log.error(
      {
        database: 'PostgreSQL',
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        code:
          error !== null && typeof error === 'object' && 'code' in error ? error.code : undefined,
      },
      'Failed to validate PostgreSQL connection',
    );
    throw error;
  }
}

export default fp(postgres, { name: 'postgres-connector' });
