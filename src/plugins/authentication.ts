import fp from "fastify-plugin";

async function authenticationPlugin() {}

export default fp(authenticationPlugin, {
  name: "authentication",
  dependencies: ["postgres-connector"],
});
