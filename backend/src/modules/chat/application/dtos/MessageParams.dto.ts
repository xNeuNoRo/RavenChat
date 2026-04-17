import { Type, Static } from "@sinclair/typebox";

export const MessageParamsSchema = Type.Object({
  id: Type.String({
    pattern: "^ChatMessages/.*", // Validamos que el ID tenga el formato correcto de la coleccion de RavenDB
    errorMessage: "El ID del mensaje no tiene un formato válido",
  }),
});

export const MessageLimitParamsSchema = Type.Object({
  limit: Type.Optional(
    Type.Number({
      minimum: 1,
      maximum: 100,
      errorMessage: "El límite debe ser un número entre 1 y 100",
    }),
  ),
});

export type MessageParamsDto = Static<typeof MessageParamsSchema>;
export type MessageLimitParamsDto = Static<typeof MessageLimitParamsSchema>;
