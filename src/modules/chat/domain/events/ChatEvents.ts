import { CreateMessageDto } from "../../application/dtos/CreateMessage.dto";
import { MessageParamsDto } from "../../application/dtos/MessageParams.dto";
import { UpdateMessageDto } from "../../application/dtos/UpdateMessage.dto";
import { ChatMessage } from "../entities/ChatMessage.entity";

// Eventos que el servidor recibe del cliente
export enum ChatInboundEvent {
  SEND_MESSAGE = "chat:message:send",
  UPDATE_MESSAGE = "chat:message:update",
  DELETE_MESSAGE = "chat:message:delete",
  TYPING = "chat:typing",
}

// Eventos que el servidor emite a los clientes
export enum ChatOutboundEvent {
  MESSAGE_CREATED = "chat:message:created",
  MESSAGE_UPDATED = "chat:message:updated",
  MESSAGE_DELETED = "chat:message:deleted",
  USER_TYPING_BROADCAST = "chat:typing:status",
  ERROR = "chat:error",
}

// Lo que el cliente DEBE enviar
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

// Realmente no deberia ir aqui,
// pero como solo es un gateway en toda la app pues lo dejamos aqui xd
export interface WsResponse<T = void> {
  status: "ok" | "error";
  data?: T;
  message?: string;
}
