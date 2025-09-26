import type {
  CreateTaskSchema,
  QueryTaskPaginationSchema,
  Task,
  UpdateTaskSchema,
} from '../../schemas/tasks.js';
import type { ReturnType, Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { PoolClient } from 'pg';

declare module 'fastify' {
  export interface FastifyInstance {
    tasksRepository: ReturnType<typeof createRepository>;
  }
}

// Derived Types
type CreateTask = Static<typeof CreateTaskSchema> & { author_id: string };
type TaskQuery = Static<typeof QueryTaskPaginationSchema>;
type UpdateTask = Static<typeof UpdateTaskSchema>;

function createRepository(fastify: FastifyInstance) {
  return {
    async create(newTask: CreateTask) {
      const client = await fastify.pg.connect();

      try {
        const result = await client.query<{ id: number }>(
          `INSERT INTO tasks (title, description, assigned_user_id, author_id, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'new', NOW(), NOW())
           RETURNING id`,
          [
            newTask.title,
            newTask.description,
            newTask.assigned_user_id ?? newTask.author_id,
            newTask.author_id,
          ],
        );
        return result.rows[0].id;
      } finally {
        client.release();
      }
    },

    // client added to allow reusing if called from an existing transaction
    async findById(id: number, client?: PoolClient): Promise<Task | null> {
      const shouldRelease = !client;

      // client = client ?? (await fastify.pg.connect());
      client ??= await fastify.pg.connect();

      try {
        const result = await client.query<Task>('SELECT * FROM tasks WHERE id = $1', [id]);
        return result.rows[0] ?? null; // result.rows[0] returns a row || undefined
      } finally {
        if (shouldRelease) {
          client.release();
        }
      }
    },

    async paginate(q: TaskQuery) {
      // console.log('🎃', JSON.stringify(q), '🫠');
      const offset = (q.page - 1) * q.limit;
      const client = await fastify.pg.connect();

      try {
        // Build dynamic WHERE clause for db query
        const whereConditions: string[] = [];
        const queryParams: Array<string | number> = [];
        let paramIndex = 1;

        // add author_id filter
        if (q.author_id !== undefined) {
          whereConditions.push(`author_id = $${paramIndex}`);
          queryParams.push(q.author_id);
          paramIndex++;
        }

        // add assigned_user_id filter
        if (q.assigned_user_id !== undefined) {
          whereConditions.push(`assigned_user_id = $${paramIndex}`);
          queryParams.push(q.assigned_user_id);
          paramIndex++;
        }

        if (q.status !== undefined) {
          whereConditions.push(`status = $${paramIndex}`);
          queryParams.push(q.status);
          paramIndex++;
        }

        queryParams.push(q.limit, offset);

        const whereClause =
          whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
          SELECT *, COUNT(*) OVER() as total
          FROM tasks
          ${whereClause}
          ORDER BY created_at ${q.order}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        // total returned on every row, so taking it from first row
        // more efficient than tow separate queries
        const result = await client.query<Task & { total: string }>(query, queryParams);

        return {
          tasks: result.rows,
          // handle situation where no rows are returned
          total: Number(result.rows[0]?.total) || 0,
        };
      } finally {
        client.release();
      }
    },

    async update(id: number, changes: UpdateTask, client?: PoolClient) {
      const shouldRelease = !client;

      client ??= await fastify.pg.connect();

      try {
        const setClauses: string[] = [];
        const queryParams: Array<string | number> = [];
        let paramIndex = 1;

        if (changes.title !== undefined) {
          setClauses.push(`title = $${paramIndex}`);
          queryParams.push(changes.title);
          paramIndex++;
        }

        if (changes.description !== undefined) {
          setClauses.push(`description = $${paramIndex}`);
          queryParams.push(changes.description);
          paramIndex++;
        }

        if (changes.assigned_user_id !== undefined) {
          setClauses.push(`assigned_user_id = $${paramIndex}`);
          queryParams.push(changes.assigned_user_id);
          paramIndex++;
        }

        if (changes.author_id !== undefined) {
          setClauses.push(`author_id = $${paramIndex}`);
          queryParams.push(changes.author_id);
          paramIndex++;
        }

        if (changes.status !== undefined) {
          setClauses.push(`status = $${paramIndex}`);
          queryParams.push(changes.status);
          paramIndex++;
        }

        if (setClauses.length === 0) {
          return await this.findById(id, client);
        }

        setClauses.push(`updated_at = NOW()`);
        queryParams.push(id);

        const query = `
          UPDATE tasks
          SET ${setClauses.join(', ')}
          WHERE id = $${paramIndex}
          `;

        const result = await client.query(query, queryParams);

        if (result.rowCount === 0) {
          return null;
        }

        return await this.findById(id, client);
      } finally {
        if (shouldRelease) {
          client.release();
        }
      }
    },

    async delete(id: number) {
      const client = await fastify.pg.connect();

      try {
        const result = await client.query('DELETE FROM tasks WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
      } finally {
        client.release();
      }
    },
  };
}

export default fp(
  function (fastify) {
    fastify.decorate('tasksRepository', createRepository(fastify));
  },
  {
    name: 'tasks-repository',
    dependencies: ['postgres-connector'],
  },
);
