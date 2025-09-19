import { FastifyPluginAsync } from "fastify";

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", {
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      return {
        description: "This is the root 😍",
        user: request.session,
      };
    },
  });
};

export default example;
