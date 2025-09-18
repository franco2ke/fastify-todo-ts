import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
// import { auth } from "../../../auth.js";

const authenticationPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  // Register authentication catchall endpoint - handles all better-auth routes:
  //
  // Core Authentication Routes:
  // POST /api/auth/sign-up/email - Email signup ✅
  // POST /api/auth/sign-in/email - Email signin ✅
  // POST /api/auth/sign-out - Sign out (clears session) ✅
  // GET  /api/auth/session - Get current session ❌
  // POST /api/auth/forget-password - Request password reset
  // POST /api/auth/reset-password - Reset password with token
  // POST /api/auth/verify-email - Verify email address ✅
  //
  // Session Management:
  // GET  /api/auth/list-sessions - List all user sessions ✅
  // POST /api/auth/revoke-session - Revoke specific session ❌
  // POST /api/auth/revoke-sessions - Revoke all sessions ❌
  //
  // Two-Factor Authentication (if enabled):
  // POST /api/auth/two-factor/enable - Enable 2FA
  // POST /api/auth/two-factor/disable - Disable 2FA
  // POST /api/auth/two-factor/verify - Verify 2FA code
  //
  // Account Management:
  // POST /api/auth/change-email - Change email address
  // POST /api/auth/change-password - Change password
  // POST /api/auth/update-user - Update user profile
  // DELETE /api/auth/delete-user - Delete user account

  /* fastify.route({
    method: ["GET", "POST"],
    url: "/*",
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });

        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        // Process authentication request
        const response = await fastify.auth.handler(req);

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error(error, "❌ Authentication Error:");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  }); */

  fastify.post("/sign-up/email", {
    schema: {
      body: Type.Object({
        name: Type.String({
          minLength: 1,
          maxLength: 255,
        }),
        email: Type.String({
          format: "email",
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

  fastify.post("/sign-in/email", {
    schema: {
      body: Type.Object({
        email: Type.String({
          format: "email",
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
        if (value) requestHeaders.append(key, value.toString());
      });
      const { headers, response } = await fastify.auth.api.signInEmail({
        returnHeaders: true,
        body: {
          email: request.body.email, // required
          password: request.body.password, // required
          rememberMe: true,
          callbackURL: "https://example.com/callback",
        },
        // This endpoint requires session cookies.
        headers: requestHeaders,
      });

      // Set cookies from auth response headers
      headers.forEach((value, key) => {
        reply.header(key, value);
      });

      console.log(headers);
      return { user: response };
    },
  });

  fastify.get("/session", {
    handler: async function getSessionHandler(request, reply) {
      const requestHeaders = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) requestHeaders.append(key, value.toString());
      });

      const data = await fastify.auth.api.getSession({
        headers: requestHeaders,
      });

      console.log(data);

      return { user: data };
    },
  });
};

export default authenticationPlugin;
