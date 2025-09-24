import type { FastifyPluginCallback } from 'fastify';

const example: FastifyPluginCallback = (fastify, opts, done): void => {
  fastify.get('/', function (request, reply) {
    reply.send('This is the Fastify Tasks Demo App API 😃');
  });

  done();
};

export default example;
