// Eventos que el servidor recibe del cliente
export enum ChatInboundEvent {
  SEND_MESSAGE = "chat:message:send",
  UPDATE_MESSAGE = "chat:message:update",
  DELETE_MESSAGE = "chat:message:delete",
}

// Eventos que el servidor emite a los clientes
export enum ChatOutboundEvent {
  MESSAGE_CREATED = "chat:message:created",
  MESSAGE_UPDATED = "chat:message:updated",
  MESSAGE_DELETED = "chat:message:deleted",
  ERROR = "chat:error",
}
