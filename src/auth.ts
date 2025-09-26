import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

import { betterAuthConfig } from './configurations/config-loader.js';

export const auth = betterAuth({
  database: new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  }),
  ...betterAuthConfig,
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;
