import fastifyRateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

async function rateLimiter(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.register(fastifyRateLimit, {
    max: fastify.config.RATE_LIMIT_MAX,
    timeWindow: "1 minute",
  });
}
export default fp(rateLimiter, {});
