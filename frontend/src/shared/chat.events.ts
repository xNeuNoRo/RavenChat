import type {
  ChatMessage,
  CreateMessageDto,
  MessageParamsDto,
  UpdateMessageDto,
} from "./chat.schemas";

// Eventos que el servidor recibe del cliente
export const ChatInboundEvent = {
  SEND_MESSAGE: "chat:message:send",
  UPDATE_MESSAGE: "chat:message:update",
  DELETE_MESSAGE: "chat:message:delete",
  TYPING: "chat:typing",
} as const;

export type ChatInboundEvent =
  (typeof ChatInboundEvent)[keyof typeof ChatInboundEvent];

// Eventos que el servidor emite a los clientes
export const ChatOutboundEvent = {
  MESSAGE_CREATED: "chat:message:created",
  MESSAGE_UPDATED: "chat:message:updated",
  MESSAGE_DELETED: "chat:message:deleted",
  USER_TYPING_BROADCAST: "chat:typing:status",
  ERROR: "chat:error",
} as const;

export type ChatOutboundEvent =
  (typeof ChatOutboundEvent)[keyof typeof ChatOutboundEvent];

// Lo que el cliente DEBE enviar (Tipado estricto)
export interface ChatInboundPayloads {
  [ChatInboundEvent.SEND_MESSAGE]: CreateMessageDto;
  [ChatInboundEvent.UPDATE_MESSAGE]: {
    params: MessageParamsDto;
    body: UpdateMessageDto;
    currentUsername: string;
  };
  [ChatInboundEvent.DELETE_MESSAGE]: {
    params: MessageParamsDto;
    currentUsername: string;
  };
  [ChatInboundEvent.TYPING]: { username: string; isTyping: boolean };
}

// Lo que el cliente VA A recibir
export interface ChatOutboundPayloads {
  [ChatOutboundEvent.MESSAGE_CREATED]: ChatMessage;
  [ChatOutboundEvent.MESSAGE_UPDATED]: ChatMessage;
  [ChatOutboundEvent.MESSAGE_DELETED]: { id: string };
  [ChatOutboundEvent.ERROR]: { message: string; code: string };
  [ChatOutboundEvent.USER_TYPING_BROADCAST]: {
    username: string;
    isTyping: boolean;
  };
}

export interface WsResponse<T = void> {
  status: "ok" | "error";
  data?: T;
  message?: string;
}

// Estructura genérica de un FastifyKit Websocket
export interface WsFrame<T = unknown> {
  event: string;
  data: T;
}
