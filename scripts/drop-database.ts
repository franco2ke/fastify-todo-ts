import { Client } from "pg";

if (Number(process.env.CAN_DROP_DATABASE) !== 1) {
  console.log(
    "❌ You can't drop the database tables. Set `CAN_DROP_DATABASE=1` environment variable to allow this operation. ❌ \n"
  );
  process.exit(1);
}

async function dropDatabase() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "password",
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    await dropTables(client);
    console.log("Database tables have been dropped successfully.");
  } catch (error) {
    console.error("Error dropping database tables:", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function dropTables(client: Client) {
  // Get all tables in the public schema
  const tablesResult = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  if (tablesResult.rows.length === 0) {
    console.log("No tables found to drop");
    return;
  }

  console.log(`Found ${tablesResult.rows.length} tables to drop`);

  // Drop all tables with CASCADE to handle dependencies
  for (const row of tablesResult.rows) {
    const tableName = row.tablename;
    console.log(`Dropping table: ${tableName}`);
    await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
  }

  console.log("✅ All tables dropped successfully");
}

dropDatabase()
  .then(() => {
    console.log("Database cleanup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database cleanup failed:", error);
    process.exit(1);
  });
