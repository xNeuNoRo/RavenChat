import { Type, Static } from "@sinclair/typebox";

export const UpdateMessageSchema = Type.Object({
  content: Type.String({
    minLength: 1,
    maxLength: 5000,
    errorMessage:
      "El contenido no puede estar vacío y debe ser menor a 5000 caracteres",
  }),
});

export type UpdateMessageDto = Static<typeof UpdateMessageSchema>;
