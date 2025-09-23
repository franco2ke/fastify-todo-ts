import fastifyRateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

async function rateLimiter(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.register(fastifyRateLimit, {
    ...opts.rateLimit,
  });
}
export default fp(rateLimiter, {});
