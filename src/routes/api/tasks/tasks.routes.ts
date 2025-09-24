import { CreateTaskSchema, TaskStatusEnum } from '../../../schemas/tasks.js';
import { type FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox';

const plugin: FastifyPluginCallbackTypebox = (fastify, _opts, done) => {
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

  done();
};

export default plugin;
