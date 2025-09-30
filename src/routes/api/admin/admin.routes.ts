import { type FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox';

const administrationPlugin: FastifyPluginCallbackTypebox = (fastify, opts, done) => {
  // List Users
  fastify.get('/list-users', {
    handler: async function listUsers(request, reply) {
      // console.log(`😃 list users handler running 🏃‍♀️`);
      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value !== undefined) headers.append(key, value.toString());
      });

      const users = await fastify.auth.api.listUsers({
        query: {
          limit: 20,
        },
        // This endpoint requires session cookies
        headers,
      });

      return users;
    },
  });

  // NOTE: Set a user role
  fastify.post('/set-role', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
        role: Type.Union([
          Type.Literal('user'),
          // Type.Literal('moderator'),
          Type.Literal('admin'),
          // Type.Literal('super-admin'),
        ]),
      }),
    },
    handler: async function setRole(request, reply) {
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value !== undefined) headers.append(key, value.toString());
      });

      const data = await fastify.auth.api.setRole({
        body: {
          userId: request.body.userId,
          role: request.body.role,
        },
        headers,
      });

      return data;
    },
  });

  done();
};

export default administrationPlugin;
