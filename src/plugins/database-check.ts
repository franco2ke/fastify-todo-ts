import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

async function databaseCheck(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const client = await fastify.pg.connect();

  // Check if todos table exists
  try {
    interface ExistsResult {
      exists: boolean;
    }

    const taskTableExists = await client.query<ExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'tasks'
      )`);

    const usersTableExists = await client.query<ExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )`);

    if (taskTableExists.rows[0].exists && usersTableExists.rows[0].exists) {
      fastify.log.info(`Database check was successful`);
      return;
    }

    if (!taskTableExists.rows[0].exists) {
      fastify.log.error('❌ tasks table does not exist');
    }

    if (!usersTableExists.rows[0].exists) {
      fastify.log.error('❌ users table does not exist');
    }
    throw new Error(
      `⚠️  Database has not been initialized. Ensure database scripts have been generated then run 'pnpm: db:setup'`,
    );
  } catch (error) {
    // FIXME Need to learn how to properly type errors, unable to just log error.msg!
    fastify.log.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

export default fp(databaseCheck, {
  name: 'database-check',
  dependencies: ['postgres-connector'],
});
