import fp from "fastify-plugin";
import fastifyPostgres from "@fastify/postgres";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

async function postgres(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  try {
    // Add pg namespace to Fastify instance, which avails postgres features
    await fastify.register(fastifyPostgres, opts.postgres);

    // Test connection with database info query
    const client = await fastify.pg.connect();
    const result = await client.query(`SELECT 
        current_database() as database_name,
        current_user as username,
        version() as version,
        NOW() as current_time`);

    client.release();
    const dbInfo = result.rows[0];

    fastify.log.info(
      {
        database: "PostgreSQL",
        status: "connected",
        databaseName: dbInfo.database_name,
        username: dbInfo.username,
        version: dbInfo.version.split(" ").slice(0, 2).join(" "),
        currentTime: dbInfo.current_time,
      },
      "PostgreSQL connection was successful"
    );
  } catch (error) {
    fastify.log.error(
      {
        database: "PostgreSQL",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      },
      "Failed to validate PostgreSQL connection"
    );
    throw error;
  }
}

export default fp(postgres, { name: "postgres-connector" });
