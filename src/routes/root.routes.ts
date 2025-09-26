import type { FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

const root: FastifyPluginCallback = (fastify, opts): void => {
  fastify.get('/', function (request, reply) {
    return 'Welcome to the Fastify Tasks Demo App 😃';
  });
};

export default fastifyPlugin(root);
