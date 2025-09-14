import path from "node:path";
import autoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyInstance, FastifyPluginOptions, FastifyServerOptions } from "fastify";

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  ajv: {
    customOptions: {
      coerceTypes: "array",
      removeAdditional: "all",
    },
  },
};

export default async function app(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // for testing purposes only
  delete opts.skipOverride;

  // load external plugins that custom plugins might depend on
  await fastify.register(autoLoad, {
    dir: path.join(import.meta.dirname, "plugins/external"),
    options: { ...opts },
  });

  console.log(`🎾 ${JSON.stringify(fastify.config)}`);

  // load custom plugins
  void fastify.register(autoLoad, {
    dir: path.join(import.meta.dirname, "plugins/app"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(autoLoad, {
    dir: path.join(import.meta.dirname, "routes"),
    autoHooks: true,
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
      "Unhandled error occurred"
    );

    reply.code(err.statusCode ?? 500);

    let message = "Internal Server Error";
    if (err.statusCode && err.statusCode < 500) {
      message = err.message;
    }

    return { message };
  });

  // An attacker could search for valid URLs if your 404 error handling is not rate limited.
  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit({
        max: 3,
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
        "Resource not found"
      );

      reply.code(404);

      return { message: "Not Found" };
    }
  );
}

export { app, options };
