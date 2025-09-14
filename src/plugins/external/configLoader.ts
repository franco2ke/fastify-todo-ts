import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

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

const environmentVariablesSchema = {
  type: "object",
  properties: {
    // Database
    MYSQL_HOST: {
      type: "string",
      default: "localhost",
    },
    MYSQL_PORT: {
      type: "number",
      default: 3306,
    },
    MYSQL_USER: {
      type: "string",
    },
    MYSQL_PASSWORD: {
      type: "string",
    },
    MYSQL_DATABASE: {
      type: "string",
    },

    // Security
    COOKIE_SECRET: {
      type: "string",
    },
    COOKIE_NAME: {
      type: "string",
    },
    COOKIE_SECURED: {
      type: "boolean",
      default: true,
    },
    RATE_LIMIT_MAX: {
      type: "number",
      default: 100, // Put it to 4 in your .env file for tests
    },

    // Files
    UPLOAD_DIRNAME: {
      type: "string",
      minLength: 1,
      pattern: "^(?!.*\\.{2}).*$",
      default: "uploads",
    },
    UPLOAD_TASKS_DIRNAME: {
      type: "string",
      default: "tasks",
    },
  },
  required: ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_USER"],
};

async function configLoader(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  await fastify.register(fastifyEnv, {
    confKey: "config",
    schema: environmentVariablesSchema,
  });
}

export default fp(configLoader, {
  name: "application-config",
});
