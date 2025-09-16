import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

async function databaseCheck(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const client = await fastify.pg.connect();

  // Check if todos table exists
  try {
    const todosTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'todos'
      )`);

    const usersTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )`);

    if (todosTableExists.rows[0].exists && usersTableExists.rows[0].exists) {
      fastify.log.info(`Database check was successful`);
      return;
    }

    console.log(todosTableExists);

    if (!todosTableExists.rows[0].exists) {
      fastify.log.error("❌ todos table does not exist");
    }

    if (!usersTableExists.rows[0].exists) {
      fastify.log.error("❌ users table does not exist");
    }
    throw new Error(`⚠️  Database has not been initialized. Run 'pnpm: db:create'`);
  } catch (error) {
    // FIXME Need to learn how to properly type errors, unable to just log error.msg!
    fastify.log.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

export default fp(databaseCheck, {
  name: "database-check",
  dependencies: ["postgres-connector"],
});
