import type { CreateTaskSchema, Task } from '../../schemas/tasks.js';
import type { ReturnType, Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  export interface FastifyInstance {
    tasksRepository: ReturnType<typeof createRepository>;
  }
}

// Derived Types
type CreateTask = Static<typeof CreateTaskSchema> & { author_id: string };

function createRepository(fastify: FastifyInstance) {
  return {
    async findByFilename(filename: string) {
      const client = await fastify.pg.connect();

      try {
        const result = await client.query<Pick<Task, 'filename'>>(
          'SELECT filename FROM tasks WHERE filename = $1',
          [filename],
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

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

    async delete(id: number) {
      const client = await fastify.pg.connect();

      try {
        const result = await client.query('DELETE FROM tasks WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
      } finally {
        client.release();
      }
    },

    createStream() {
      // PostgreSQL streaming would require different approach
      // This is a simplified version - you might want to use pg-query-stream
      throw new Error('Streaming not implemented for PostgreSQL client');
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
