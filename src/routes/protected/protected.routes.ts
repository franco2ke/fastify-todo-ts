import type { FastifyPluginAsync } from 'fastify';

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      return {
        description: 'This is the protected route 🔐',
        user: request.session,
      };
    },
  });
};

export default example;
