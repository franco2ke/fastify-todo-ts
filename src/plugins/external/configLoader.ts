import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import environmentVariablesSchema from "../../schemas/environmentVariables.js";

// extending the existing FastifyInstance to include a config property
declare module "fastify" {
  export interface FastifyInstance {
    config: {
      PORT: number;
      MYSQL_HOST: string;
      MYSQL_PORT: string;
      MYSQL_USER: string;
      MYSQL_PASSWORD: string;
      MYSQL_DATABASE: string;
      COOKIE_SECRET: string;
      COOKIE_NAME: string;
      COOKIE_SECURED: boolean;
      RATE_LIMIT_MAX: number;
      UPLOAD_DIRNAME: string;
      UPLOAD_TASKS_DIRNAME: string;
    };
  }
}

const configLoader: FastifyPluginAsyncTypebox = async function (fastify, _opts) {
  await fastify.register(fastifyEnv, {
    confKey: "config",
    schema: environmentVariablesSchema,
  });
};

export default fp(configLoader, {
  name: "application-config",
});
