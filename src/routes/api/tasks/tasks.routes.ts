import {
  CreateTaskSchema,
  QueryTaskPaginationSchema,
  TaskPaginationResultSchema,
  TaskSchema,
  TaskStatusEnum,
  UpdateTaskSchema,
} from '../../../schemas/tasks.js';
import { type FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox';

const plugin: FastifyPluginCallbackTypebox = (fastify, _opts, done) => {
  // NOTE: Create Task Route
  const { tasksRepository } = fastify;
  fastify.post('/', {
    schema: {
      body: CreateTaskSchema,
      response: {
        201: {
          id: Type.Number(),
        },
        401: {
          error: Type.String(),
        },
      },
      tags: ['Tasks'],
    },
    onRequest: [fastify.authenticate.bind(fastify)],
    handler: async function (request, reply) {
      if (!request.session) {
        reply.code(401);
        return { error: 'Unauthorized' };
      }

      const newTask = {
        ...request.body,
        author_id: request.session.userId,
        status: TaskStatusEnum.New,
      };

      const id = await tasksRepository.create(newTask);

      reply.code(201);

      return { id };
    },
  });

  // NOTE: Get Task by ID Route
  fastify.get('/:id', {
    schema: {
      params: Type.Object({
        id: Type.Number(),
      }),
      response: {
        200: TaskSchema,
        404: Type.Object({ message: Type.String() }),
      },
      tags: ['Tasks'],
    },
    onRequest: [fastify.authenticate.bind(fastify)],
    // preHandler: (request, reply) => request.isAdmin(reply),
    handler: async function (request, reply) {
      const { id } = request.params;

      const task = await tasksRepository.findById(id);
      if (!task) {
        reply.code(404);
        return { message: 'Task not found' };
      }

      return task;
    },
  });

  // NOTE: Get tasks with pagination, filtering
  fastify.get('/', {
    schema: {
      querystring: QueryTaskPaginationSchema,
      response: {
        200: TaskPaginationResultSchema,
      },
      tags: ['Tasks'],
    },

    handler: async function (request) {
      return await tasksRepository.paginate(request.query);
    },
  });

  // NOTE: Update Task Route
  fastify.patch('/:id', {
    schema: {
      params: Type.Object({
        id: Type.Number(),
      }),
      body: UpdateTaskSchema,
      response: {
        200: TaskSchema,
        404: Type.Object({ message: Type.String() }),
      },
      tags: ['Tasks'],
    },
    onRequest: [fastify.authenticate.bind(fastify)],
    // preHandler: (request, reply) => request.isAdmin(reply),
    handler: async function (request, reply) {
      const { id } = request.params;

      const updatedTask = await tasksRepository.update(id, request.body);

      if (!updatedTask) {
        reply.code(404);
        return { message: 'Task not found' };
      }

      return updatedTask;
    },
  });

  // NOTE: Delete Task Route
  fastify.delete('/:id', {
    schema: {
      params: Type.Object({
        id: Type.Number(),
      }),
      response: {
        204: Type.Null(),
        404: Type.Object({ message: Type.String() }),
      },
      tags: ['Tasks'],
    },
    onRequest: [fastify.authenticate.bind(fastify)],
    // preHandler: (request, reply) => request.isAdmin(reply),
    handler: async function (request, reply) {
      const deleted = await tasksRepository.delete(request.params.id);

      if (!deleted) {
        reply.code(404);
        return { message: 'Task not found' };
      }

      reply.code(204);
      return null;
    },
  });

  // NOTE: Assign/Unassign Task Route (Moderator-only)
  fastify.post('/:id/assign', {
    schema: {
      params: Type.Object({
        id: Type.Number(),
      }),
      body: Type.Object({
        assigned_user_id: Type.Union([Type.String(), Type.Null()]),
      }),
      response: {
        200: TaskSchema,
        401: Type.Object({ error: Type.String() }),
        403: Type.Object({ error: Type.String() }),
        404: Type.Object({ message: Type.String() }),
      },
      tags: ['Tasks'],
    },
    onRequest: [fastify.authenticate.bind(fastify)],
    // TODO: Add moderator check when role system is implemented
    // preHandler: (request, reply) => request.isModerator(reply),
    handler: async function (request, reply) {
      const { session } = request;
      if (!session) {
        reply.code(401);
        return { error: 'Authentication required' };
      }

      // TODO: Replace with proper role check when implemented
      // For now, assuming all authenticated users can assign tasks
      // if (!session.user.isModerator) {
      //   reply.code(403);
      //   return { error: 'Moderator access required' };
      // }

      const { id } = request.params;
      const assignedUserId = request.body.assigned_user_id;

      const updatedTask = await tasksRepository.update(id, {
        assigned_user_id: assignedUserId ?? undefined,
      });

      if (!updatedTask) {
        reply.code(404);
        return { message: 'Task not found' };
      }

      return updatedTask;
    },
  });

  done();
};

export default plugin;
