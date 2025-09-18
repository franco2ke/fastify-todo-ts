import fp from "fastify-plugin";
import { betterAuth } from "better-auth";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  export interface FastifyInstance {
    auth: ReturnType<typeof betterAuth>;
  }
}

async function authenticationPlugin(fastify: FastifyInstance) {
  const auth = betterAuth({
    database: fastify.pg.pool,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
  });

  fastify.decorate("auth", auth);
}

export default fp(authenticationPlugin, {
  name: "authentication",
  dependencies: ["postgres-connector"],
});
