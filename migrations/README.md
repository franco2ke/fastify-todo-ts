# Database Migrations

This folder contains database migrations for the Fastify Todo application.

## Start Here 🎯

Before any migrations you need to ensure the database is created and the app has the correct
credentials to access it. Do the following:

1. Get the database credentials.
2. Use docker-it, psql or createdb with the credentials to initialize the database.
3. Update the `.env` file in the root directory with the database access cresentials

## Structure

```
migrations/
├── auth/           # Better-auth generated tables
│   └── schema.sql  # Auth tables (users, sessions, accounts, verifications)
└── business/       # Application-specific tables
    └── *.sql       # Business logic migrations (numbered sequentially)
```

## Auth Tables (Better-Auth)

Auth tables are managed by the Better-Auth CLI and contain user authentication data.

### Commands

```bash
# Generate auth schema (updates schema.sql)
pnpm run db:auth:generate

# Apply auth tables to database
pnpm run db:auth:migrate
```

### Tables Created

- `users` - User accounts
- `sessions` - User sessions
- `accounts` - OAuth provider accounts
- `verifications` - Email/phone verification tokens
- `And more...` - Depending on better-auth options selected

## Business Tables

Business tables contain your application data and are managed by the custom migration system.

1. Run the initial migration to create the business logic tables

### Commands

```bash
# Run pending business migrations
pnpm run db:migrate
```

### Creating New Migrations

1. Create a new `.sql` file in `migrations/business/` with a numeric prefix:

   ```
   002_add_categories_table.sql
   003_add_user_preferences.sql
   004_alter_todos_add_priority.sql
   ```

2. Write your SQL migration:

   ```sql
   -- 002_add_categories_table.sql
   CREATE TABLE categories (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     color VARCHAR(7),
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Run migrations:
   ```bash
   pnpm run db:migrate
   ```

### Migration Tracking

The system automatically tracks executed migrations in the `schema_migrations` table:

- Migrations run in alphabetical order
- Each migration runs in a transaction (rollback on failure)
- Already-executed migrations are skipped
- Failed migrations stop the process

## Complete Database Setup

For a fresh database setup, setup access credentials then run these commands in order:

```bash
# Set up all tables (auth + business)
pnpm run db:setup
```

Or individually:

```bash
# Set up auth tables
pnpm run db:auth:migrate

# Set up business tables
pnpm run db:migrate
```

## Database Reset

To completely reset the database:

```bash
# 1. Drop all the tables
pnpm run db:drop

# 2. Create new tables (initial migration)
pnpm run db:setup
```

This will:

1. Drop all the database tables
2. Create a fresh database
3. Run auth migrations
4. Run business migrations
