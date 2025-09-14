import { Type } from "@fastify/type-provider-typebox";

const environmentVariablesSchema = Type.Object(
  {
    // Database
    MYSQL_HOST: Type.String({ default: "localhost" }),
    MYSQL_PORT: Type.Number({ default: 3306 }),
    MYSQL_USER: Type.String(),
    MYSQL_PASSWORD: Type.String(),
    MYSQL_DATABASE: Type.String(),

    // Security
    COOKIE_SECRET: Type.String(),
    COOKIE_NAME: Type.String(),
    COOKIE_SECURED: Type.Boolean({ default: true }),
    RATE_LIMIT_MAX: Type.Number({ default: 100 }), // Put it to 4 in your .env file for tests

    // Files
    UPLOAD_DIRNAME: Type.String({
      minLength: 1,
      pattern: "^(?!.*\\.{2}).*$",
      default: "uploads",
    }),
    UPLOAD_TASKS_DIRNAME: Type.String({ default: "tasks" }),
  },
  {
    required: ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_USER"],
  }
);

export default environmentVariablesSchema;
