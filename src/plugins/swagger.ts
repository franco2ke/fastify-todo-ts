import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

async function swaggerPlugin(fastify: FastifyInstance, opt: FastifyPluginOptions) {
  void fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Todo App API 😅",
        description:
          "A Fastify based backend for managing task / todos, with BetterAuth authentication.",
        version: "0.5.0",
      },
      // consumes: ["application/json"],
      // produces: ["application/json"],
      // tags: [
      //   {
      //     name: "Hello World",
      //     description: "You can use these routes to salute whomever you want.",
      //   },
      // ],
    },
  });

  void fastify.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
  });
}

export default fp(swaggerPlugin);
