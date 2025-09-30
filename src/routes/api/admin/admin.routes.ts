import { fastifyHeadersToStandardHeaders } from '../../../utils/headers-converter.js';
import { type FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox';

// TODO: add request, response schemas

const administrationPlugin: FastifyPluginCallbackTypebox = (fastify, opts, done) => {
  // Create User
  fastify.post('/create-user', {
    schema: {
      body: Type.Object({
        email: Type.String({
          format: 'email',
          minLength: 1,
          maxLength: 255,
        }),
        name: Type.String(),
        password: Type.String(),
        // FIXME: Find a way to automatically extract role types from better-auth
        role: Type.Optional(Type.Union([Type.Literal('user'), Type.Literal('admin')])),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function createUser(request, reply) {
      const newUser = await fastify.auth.api.createUser({
        body: {
          email: request.body.email,
          name: request.body.name,
          password: request.body.password,
          role: request.body.role ?? 'user',
        },
      });

      return newUser;
    },
  });

  // List Users
  fastify.get('/list-users', {
    schema: {
      tags: ['Admin Functions'],
    },
    // onRequest: [fastify.authenticate.bind(fastify)],
    handler: async function listUsers(request, reply) {
      // Convert Fastify headers to standard Headers object
      const headers = fastifyHeadersToStandardHeaders(request);

      // TODO To create robust db query from request parameters

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
        // FIXME: Find a way to automatically extract role types from better-auth
        role: Type.Union([
          Type.Literal('user'),
          // Type.Literal('moderator'),
          Type.Literal('admin'),
          // Type.Literal('super-admin'),
        ]),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function setRole(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

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

  // NOTE: Set a user password
  fastify.post('/set-user-password', {
    schema: {
      body: Type.Object({
        userId: Type.String(),
        newPassword: Type.String(),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function setUserPassword(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.setUserPassword({
        body: {
          newPassword: request.body.newPassword,
          userId: request.body.userId,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: Update user
  fastify.post('/update-user', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
        data: Type.Object({
          name: Type.Optional(Type.String()),
          email: Type.Optional(
            Type.String({
              format: 'email',
              minLength: 1,
              maxLength: 255,
            }),
          ),
          // Add other user fields as needed
        }),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function updateUser(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.adminUpdateUser({
        body: {
          userId: request.body.userId,
          data: request.body.data,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: Ban user
  fastify.post('/ban-user', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
        banReason: Type.Optional(Type.String()),
        banExpiresIn: Type.Optional(Type.Number()),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function banUser(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.banUser({
        body: {
          userId: request.body.userId,
          banReason: request.body.banReason,
          banExpiresIn: request.body.banExpiresIn,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: Unban user
  fastify.post('/unban-user', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function unbanUser(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.unbanUser({
        body: {
          userId: request.body.userId,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: List user sessions
  fastify.post('/list-user-sessions', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function listUserSessions(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.listUserSessions({
        body: {
          userId: request.body.userId,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: Revoke user session
  fastify.post('/revoke-user-session', {
    schema: {
      body: Type.Object({
        sessionToken: Type.String({
          minLength: 1,
        }),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function revokeUserSession(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.revokeUserSession({
        body: {
          sessionToken: request.body.sessionToken,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: Revoke user sessions
  fastify.post('/revoke-user-sessions', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function revokeUserSessions(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.revokeUserSessions({
        body: {
          userId: request.body.userId,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: Impersonate user
  fastify.post('/impersonate-user', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function impersonateUser(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.impersonateUser({
        body: {
          userId: request.body.userId,
        },
        headers,
      });

      return data;
    },
  });

  // NOTE: Stop impersonating and continue with your admin account
  fastify.post('/stop-impersonating', {
    schema: {
      tags: ['Admin Functions'],
    },
    handler: async function stopImpersonating(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const data = await fastify.auth.api.stopImpersonating({
        headers,
      });

      return data;
    },
  });

  // NOTE: Remove user
  fastify.post('/remove-user', {
    schema: {
      body: Type.Object({
        userId: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
      }),
      tags: ['Admin Functions'],
    },
    handler: async function removeUser(request, reply) {
      const headers = fastifyHeadersToStandardHeaders(request);

      const deletedUser = await fastify.auth.api.removeUser({
        body: {
          userId: request.body.userId,
        },
        headers,
      });

      return deletedUser;
    },
  });

  done();
};

export default administrationPlugin;
