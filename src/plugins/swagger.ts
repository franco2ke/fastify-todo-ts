import fastifySwagger, { type SwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

interface PluginOptions extends FastifyPluginOptions {
  swagger: {
    config: SwaggerOptions;
    routePrefix: string;
  };
}

async function swaggerPlugin(fastify: FastifyInstance, opts: PluginOptions) {
  await fastify.register(fastifySwagger, opts.swagger.config);

  await fastify.register(fastifySwaggerUi, {
    routePrefix: opts.swagger.routePrefix,
  });
}

export default fp(swaggerPlugin);
