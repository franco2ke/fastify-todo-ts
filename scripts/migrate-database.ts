import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { Client } from 'pg';

async function runMigrations() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of already executed migrations
    const executedMigrations = await client.query(
      'SELECT filename FROM schema_migrations ORDER BY filename',
    );
    const executedSet = new Set(executedMigrations.rows.map((row) => row.filename));

    // Read migration files from directory
    const migrationsDir = join(process.cwd(), 'migrations/business');
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort(); // Execute in alphabetical order

    console.log(`Found ${sqlFiles.length} migration files`);

    for (const file of sqlFiles) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Executing migration: ${file}`);

      const filePath = join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf-8');

      // Execute migration in a transaction
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Migration ${file} failed:`, error);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

runMigrations()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
