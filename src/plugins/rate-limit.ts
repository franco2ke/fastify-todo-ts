import fastifyRateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

async function rateLimiter(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.register(fastifyRateLimit, {
    ...opts.rateLimit,
  });
}
export default fp(rateLimiter, {});
