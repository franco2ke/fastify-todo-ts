import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Static } from "@sinclair/typebox";
import environmentVariablesSchema from "../schemas/environment-variables.js";

// Automatically derive config type from schema
type ConfigType = Static<typeof environmentVariablesSchema> & {
  PORT?: number; // Add any additional properties not in schema
};

// extending the existing FastifyInstance to include a config property
declare module "fastify" {
  export interface FastifyInstance {
    secrets: ConfigType;
    config: {
      configStatus: boolean;
      postgres: {
        connectionString: string;
      };
      rateLimit: {
        max: number;
        timeWindow: string;
      };
    };
  }
}

const configLoader: FastifyPluginAsyncTypebox = async function (fastify, _opts) {
  await fastify.register(fastifyEnv, {
    confKey: "secrets",
    schema: environmentVariablesSchema,
  });

  fastify.decorate("config", {
    configStatus: true,
    postgres: {
      connectionString: `postgres://${fastify.secrets.POSTGRES_USER}:${fastify.secrets.POSTGRES_PASSWORD}@${fastify.secrets.POSTGRES_HOST}:${fastify.secrets.POSTGRES_PORT}/${fastify.secrets.POSTGRES_DATABASE}`,
      databaseString: "done ✅",
    },
    rateLimit: {
      max: fastify.secrets.RATE_LIMIT_MAX,
      timeWindow: "1 minute",
    },
  });
};

export default fp(configLoader, {
  name: "application-config",
});
