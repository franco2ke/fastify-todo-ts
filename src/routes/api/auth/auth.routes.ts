import { type FastifyPluginCallbackTypebox, Type } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';

const authenticationPlugin: FastifyPluginCallbackTypebox = (fastify, _opts, done) => {
  async function authHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value !== undefined) headers.append(key, value.toString());
      });

      const getRequestBody = (method: string, body: unknown) => {
        // GET requests shouldn't have bodies
        if (method === 'GET' || method === 'HEAD') return null;

        // Handle different body types
        if (body === null || body === undefined) return null;
        if (typeof body === 'string') return body;

        return JSON.stringify(body);
      };

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body: getRequestBody(request.method, request.body),
      });

      // Process authentication request
      const response = await fastify.auth.handler(req);

      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      fastify.log.error(error, '❌ Authentication Error:');
      reply.status(500).send({
        error: 'Internal authentication error',
        code: 'AUTH_FAILURE',
      });
    }
  }

  fastify.post('/sign-out', {
    handler: authHandler,
  });

  fastify.post('/forget-password', {
    handler: authHandler, //✅
  });

  fastify.post('/reset-password', {
    handler: authHandler, //✅
  });

  fastify.post('/verify-email', {
    handler: authHandler, // ❌
  });

  fastify.get('/list-sessions', {
    handler: authHandler, // ❌
  });

  fastify.post('/revoke-session', {
    handler: authHandler, // ✅
  });

  fastify.post('/revoke-sessions', {
    handler: authHandler, // ✅
  });

  // fastify.post("/two-factor/enable", {
  //   handler: authHandler,
  // });

  // fastify.post("/two-factor/disable", {
  //   handler: authHandler,
  // });

  // fastify.post("/two-factor/verify", {
  //   handler: authHandler,
  // });

  fastify.post('/change-email', {
    handler: authHandler, // ✅
  });

  fastify.post('/change-password', {
    handler: authHandler, // ✅
  });

  fastify.post('/update-user', {
    handler: authHandler, // ✅
  });

  fastify.delete('/delete-user', {
    handler: authHandler, // ❌
  });

  fastify.post('/sign-up/email', {
    schema: {
      body: Type.Object({
        name: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
        email: Type.String({
          format: 'email',
          minLength: 1,
          maxLength: 255,
        }),
        password: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
      }),
    },
    handler: async function signUpHandler(request, reply) {
      const { headers, response } = await fastify.auth.api.signUpEmail({
        returnHeaders: true,
        body: {
          name: request.body.name, // required
          email: request.body.email, // required
          password: request.body.password, // required
        },
      });

      // Set cookies from auth response headers
      headers.forEach((value, key) => {
        reply.header(key, value);
      });

      return { user: response };
    },
  });

  fastify.post('/sign-in/email', {
    schema: {
      body: Type.Object({
        email: Type.String({
          format: 'email',
          minLength: 1,
          maxLength: 255,
        }),
        password: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
      }),
    },

    handler: async function signInHandler(request, reply) {
      const requestHeaders = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value !== undefined) requestHeaders.append(key, value.toString());
      });
      const { headers, response } = await fastify.auth.api.signInEmail({
        returnHeaders: true,
        body: {
          email: request.body.email, // required
          password: request.body.password, // required
          rememberMe: true,
          callbackURL: 'https://example.com/callback',
        },
        // This endpoint requires session cookies.
        headers: requestHeaders,
      });

      // Set cookies from auth response headers
      headers.forEach((value, key) => {
        reply.header(key, value);
      });

      // console.log(headers);
      return { user: response };
    },
  });

  fastify.get('/session', {
    handler: async function getSessionHandler(request, reply) {
      const requestHeaders = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value !== undefined) requestHeaders.append(key, value.toString());
      });

      const data = await fastify.auth.api.getSession({
        headers: requestHeaders,
      });

      return { user: data };
    },
  });

  done();
};

export default authenticationPlugin;
