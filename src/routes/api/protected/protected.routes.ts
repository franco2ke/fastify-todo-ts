import type { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';

const example: FastifyPluginCallback = (fastify, opts) => {
  fastify.get('/', {
    onRequest: [fastify.authenticate.bind(fastify)],
    handler: function (request: FastifyRequest, reply: FastifyReply) {
      reply.send({
        description: 'This is a protected route 🔐',
        user: request.user,
        session: request.session,
      });
    },
  });
};

export default example;
