import type { FastifyPluginCallback } from 'fastify';

const example: FastifyPluginCallback = (fastify, opts, done): void => {
  fastify.get('/', function (request, reply) {
    return { apiRoot: 'this is the api root' };
  });

  done();
};

export default example;
