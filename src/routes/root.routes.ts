import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return 'This is the root/base route';
  });
};

export default fastifyPlugin(root);
