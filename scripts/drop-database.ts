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
    database: process.env.POSTGRES_DATABASE || "postgres",
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
  // Drop tables in reverse order of creation due to foreign key constraints
  // Drop todos first (has foreign key to users)
  await client.query("DROP TABLE IF EXISTS todos CASCADE");
  console.log("todos table dropped.");

  // Drop users table
  await client.query("DROP TABLE IF EXISTS users CASCADE");
  console.log("users table dropped.");
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