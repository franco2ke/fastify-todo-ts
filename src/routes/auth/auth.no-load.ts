import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { auth } from "../../auth.js";

const authenticationPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  // Register authentication endpoint
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
        const response = await auth.handler(req);

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error(error, "❌Authentication Error:");
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
      const data = await auth.api.signUpEmail({
        body: {
          name: request.body.name, // required
          email: request.body.email, // required
          password: request.body.password, // required
        },
      });
      return { user: data };
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
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      const data = await auth.api.signInEmail({
        body: {
          email: request.body.email, // required
          password: request.body.password, // required
          rememberMe: true,
          callbackURL: "https://example.com/callback",
        },
        // This endpoint requires session cookies.
        headers: headers,
      });
      return { user: data };
    },
  });

  fastify.post("/sign-out/email", {
    handler: async function signOutHandler(request, reply) {
      console.log("🔍 Original headers:", request.headers);

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      console.log("🔍 Converted headers:", Array.from(headers.entries()));

      try {
        const result = await auth.api.signOut({
          // This endpoint requires session cookies.
          headers: headers,
        });
        console.log("✅ Sign out successful:", result);
        return { success: true };
      } catch (error) {
        console.log("❌ Sign out error:", error);
        throw error;
      }
    },
  });
};

export default authenticationPlugin;
