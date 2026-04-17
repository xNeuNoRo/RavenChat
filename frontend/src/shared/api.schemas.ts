import { Type, type Static, type TSchema } from "@sinclair/typebox";

// Esquema para errores generales de la API (Basado en tu clase ApiError)
export const ApiErrorSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  details: Type.Optional(Type.Any()),
});

// Tipos inferidos para los errores
export type ApiError = Static<typeof ApiErrorSchema>;

// Tipo TypeScript inferido a partir del esquema de respuesta de la API
// Solamente dos estados posibles, uno con datos y sin error, y otro con error y sin datos
export type ApiResponseStrictFromSchema<T extends TSchema> =
  | { ok: true; data: Static<T>; error: null; timestamp: string }
  | { ok: false; data: null; error: ApiError; timestamp: string };

// Factory para crear un esquema de respuesta de la API que valida tanto el caso de éxito como el de error
// Usamos Type.Union para simular el discriminated union basado en la estructura de tu framework
export const ApiResponseStrictSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Union([
    // Caso de éxito: ok es true, data es del tipo esperado, error es null
    Type.Object({
      ok: Type.Literal(true),
      data: dataSchema,
      error: Type.Null(),
      timestamp: Type.String({ format: "date-time" }),
    }),
    // Caso de error: ok es false, data es null, error es del tipo ApiError
    Type.Object({
      ok: Type.Literal(false),
      data: Type.Null(),
      error: ApiErrorSchema,
      timestamp: Type.String({ format: "date-time" }),
    }),
  ]);
