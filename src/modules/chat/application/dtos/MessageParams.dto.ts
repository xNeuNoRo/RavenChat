import { Type, Static } from "@sinclair/typebox";

export const MessageParamsSchema = Type.Object({
  id: Type.String({
    pattern: "^ChatMessages/.*", // Validamos que el ID tenga el formato correcto de la coleccion de RavenDB
    errorMessage: "El ID del mensaje no tiene un formato válido",
  }),
});

export type MessageParamsDto = Static<typeof MessageParamsSchema>;
