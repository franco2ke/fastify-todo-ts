import fp from 'fastify-plugin';

export interface SupportPluginOptions {
  description: string;
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>((fastify, opts, done) => {
  fastify.decorate('someSupport', function () {
    // return opts.description;
    return 'hugs';
  });
  done();
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    someSupport(): string;
  }
}
