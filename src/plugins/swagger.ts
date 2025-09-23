import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

async function swaggerPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  void fastify.register(fastifySwagger, {
    swagger: { ...opts.swagger.config },
  });

  void fastify.register(fastifySwaggerUi, {
    routePrefix: opts.swagger.routePrefix,
  });
}

export default fp(swaggerPlugin);
