import { Type, Static } from "@sinclair/typebox";

export const CreateMessageSchema = Type.Object({
  username: Type.String({
    minLength: 1,
    errorMessage: "El nombre de usuario es requerido",
  }),
  content: Type.String({
    minLength: 1,
    maxLength: 5000,
    errorMessage: "El mensaje debe tener entre 1 y 5000 caracteres",
  }),
});

// Inferimos el tipo de TS a partir del esquema
export type CreateMessageDto = Static<typeof CreateMessageSchema>;
