import { Client } from "pg";

if (Number(process.env.CAN_CREATE_DATABASE) !== 1) {
  console.log(
    "❌ You can't create the database. Set `CAN_CREATE_DATABASE=1` environment variable to allow this operation. ❌ \n"
  );
  process.exit(1);
}

async function createDatabase() {
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

    // Check if todos table exists
    const todosTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'todos'
      );
    `);

    if (!todosTableExists.rows[0].exists) {
      console.log("Creating todos table...");

      await client.query(`
        CREATE TABLE todos (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          done BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER NOT NULL,
          CONSTRAINT fk_todos_user_id FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      console.log("todos table created successfully");
    } else {
      console.log("todos table already exists");
    }
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    await client.end();
  }
}

createDatabase()
  .then(() => {
    console.log("Database setup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
