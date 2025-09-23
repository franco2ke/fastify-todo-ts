import { Type } from '@fastify/type-provider-typebox';

const environmentVariablesSchema = Type.Object(
  {
    NODE_ENV: Type.String({ default: 'production' }),
    // Server
    FASTIFY_PORT: Type.Number(),
    FASTIFY_ADDRESS: Type.String(),
    FASTIFY_CLOSE_GRACE_DELAY: Type.Number(),
    LOG_LEVEL: Type.String(),

    CAN_DROP_DATABASE: Type.Number(),
    CAN_SEED_DATABASE: Type.Number(),

    // Database
    POSTGRES_HOST: Type.String({ default: 'localhost' }),
    POSTGRES_PORT: Type.Number({ default: 5432 }),
    POSTGRES_DATABASE: Type.String(),
    POSTGRES_USER: Type.String(),
    POSTGRES_PASSWORD: Type.String(),

    // Security
    RATE_LIMIT_MAX: Type.Number({ default: 100 }), // Put it to 4 in your .env file for tests
  },
  {
    required: ['POSTGRES_USER', 'POSTGRES_PASSWORD'],
  },
);

export default environmentVariablesSchema;
