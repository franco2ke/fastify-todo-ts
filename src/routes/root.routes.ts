import type { FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

const root: FastifyPluginCallback = (fastify, opts): void => {
  fastify.get('/', function (request, reply) {
    reply.send('This is the root/base route');
  });
};

export default fastifyPlugin(root);
