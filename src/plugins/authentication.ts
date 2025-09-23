import { betterAuth } from 'better-auth';
import type { Session } from 'better-auth/types';
import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  export interface FastifyInstance {
    auth: ReturnType<typeof betterAuth>;
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<{ authenticated: string }>;
  }

  export interface FastifyRequest {
    session: Session | null;
  }
}

function authenticationPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): void {
  const auth = betterAuth({
    database: fastify.pg.pool,
    ...opts.betterAuth,
  });

  fastify.decorate('auth', auth);
  fastify.decorateRequest('session', null);

  fastify.decorate(
    'authenticate',
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      // Convert Fastify's IncomingHttpHeaders to HeadersInit format/type
      // Problem: IncomingHttpHeaders object has values of type: string | string[] | undefined
      // Solution: Headers constructor needs Record<string, string> (no undefined, no arrays)
      const requestHeaders: Record<string, string> = {};

      for (const [key, value] of Object.entries(request.headers)) {
        if (value !== undefined) {
          requestHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
        }
      }

      const sessionData = await fastify.auth.api.getSession({
        headers: new Headers(requestHeaders),
      });

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions -- better-auth getSession() can return null when user is not authenticated
      if (!sessionData?.session) {
        return await reply.unauthorized('You must be logged in to access this resource.');
      }

      request.setDecorator('session', sessionData);
      return { authenticated: 'true' };
    },
  );
}

export default fp(authenticationPlugin, {
  name: 'authentication',
  dependencies: ['postgres-connector'],
});
