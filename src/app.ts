import AutoLoad from '@fastify/autoload';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import path from 'node:path';

import configLoader from './configurations/config-loader.js';
import options from './configurations/server-options.js';

export default async function app(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  delete opts.skipOverride; // This option only serves testing purpose

  // load configuration before loading other plugins
  await fastify.register(configLoader);
  fastify.log.info(
    `The .env variables and app configuration have ${
      fastify?.config?.configStatus ? 'loaded successfully ✅' : 'failed to load ❌'
    } `,
  );

  // load all plugins from plugins folder
  await fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'plugins'),
    ignorePattern: /.*.no-load\.(ts|js)/,
    options: fastify.config,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, 'routes'),
    autoHooks: true,
    ignorePattern: /.*.no-load\.(ts|js)/,
    cascadeHooks: true,
    options: opts,
  });

  fastify.setErrorHandler((err, request, reply) => {
    fastify.log.error(
      {
        err,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
          headers: request.headers,
        },
      },
      'Unhandled error occurred',
    );

    reply.code(err.statusCode ?? 500);

    let message = 'Internal Server Error';
    if (err.statusCode && err.statusCode < 500) {
      message = err.message;
    }

    return { message };
  });

  // An attacker could search for valid URLs if your 404 error handling is not rate limited.
  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit({
        max: 4,
        timeWindow: 500,
      }),
    },
    (request, reply) => {
      request.log.warn(
        {
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
          },
        },
        'Resource not found',
      );

      reply.code(404);

      return { message: 'Not Found' };
    },
  );
}

export { app, options };
