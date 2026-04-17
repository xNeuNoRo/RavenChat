import { Type, type Static } from "@sinclair/typebox";

// --- Esquemas de Mensajes ---

export const ChatMessageSchema = Type.Object({
  id: Type.Optional(Type.String()),
  content: Type.String(),
  username: Type.String(),
  createdAt: Type.String(), // ISO String
});
export const ChatMessagesSchema = Type.Array(ChatMessageSchema);

export type ChatMessage = Static<typeof ChatMessageSchema>;
export type ChatMessages = Static<typeof ChatMessagesSchema>;

// --- Esquemas de Estadísticas de Usuario ---

export const UserActivityStatsSchema = Type.Object(
  {
    username: Type.String(),
    totalMessages: Type.Number(),
    lastMessageAt: Type.String(),
  },
  { additionalProperties: true }, // Permitimos propiedades adicionales por los metadatos de ravenDB
);
export const UserActivityStatsArraySchema = Type.Array(UserActivityStatsSchema);

export type UserActivityStats = Static<typeof UserActivityStatsSchema>;
export type UserActivityStatsArray = Static<
  typeof UserActivityStatsArraySchema
>;

// --- DTOs de Operaciones ---

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

export const UpdateMessageSchema = Type.Object({
  content: Type.String({
    minLength: 1,
    maxLength: 5000,
    errorMessage:
      "El contenido no puede estar vacío y debe ser menor a 5000 caracteres",
  }),
});

export const MessageParamsSchema = Type.Object({
  id: Type.String({
    pattern: "^ChatMessages/.*",
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

// --- Tipos Inferidos ---

export type CreateMessageDto = Static<typeof CreateMessageSchema>;
export type UpdateMessageDto = Static<typeof UpdateMessageSchema>;
export type MessageParamsDto = Static<typeof MessageParamsSchema>;
export type MessageLimitParamsDto = Static<typeof MessageLimitParamsSchema>;
