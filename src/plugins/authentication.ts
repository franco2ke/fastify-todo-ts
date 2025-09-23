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
      const session = await fastify.auth.api.getSession({
        headers: new Headers(request.headers as Record<string, string>),
      });

      if (!session?.user) {
        return await reply.unauthorized('You must be logged in to access this resource.');
      }

      request.setDecorator('session', session);
      return { authenticated: 'true' };
    },
  );
}

export default fp(authenticationPlugin, {
  name: 'authentication',
  dependencies: ['postgres-connector'],
});
