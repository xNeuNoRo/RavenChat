import { Type } from "@sinclair/typebox"; // O Zod, el que prefieras

export const envSchema = Type.Object({
  PORT: Type.Number({ default: 4000 }),
  HOST: Type.String({ default: "0.0.0.0" }),
  DATABASE_URL: Type.String(),
  DATABASE_NAME: Type.String(),
  NODE_ENV: Type.Union(
    [
      Type.Literal("development"),
      Type.Literal("production"),
      Type.Literal("test"),
    ],
    { default: "development" },
  ),
});

export type EnvSchemaType = typeof envSchema;
