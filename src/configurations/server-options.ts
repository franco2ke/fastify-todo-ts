import type { FastifyServerOptions } from 'fastify';

// NOTE: these options are passed to the fastify constructor / factory function
// Used when creating the root application instance, before any plugins load
// Pass '--options' flag via CLI arguments in command to enable these options.

const options: FastifyServerOptions = {
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all',
    },
  },
};

export default options;
