import { useCallback } from "react";
import { chatSocket } from "../../lib/SocketClient";
import {
  ChatInboundEvent,
  type ChatInboundPayloads,
} from "../../shared/chat.events";

/**
 * @description Hook funcional para emitir eventos al socket con tipado estricto.
 * Incluye soporte opcional para ejecutar un fallback HTTP si el socket está desconectado.
 */
export function useSocketEmitter() {
  return useCallback(
    async <T, InboundEvent extends ChatInboundEvent>(
      event: InboundEvent,
      payload: ChatInboundPayloads[InboundEvent],
      httpFallback?: () => Promise<T>,
    ): Promise<T | void> => {
      // Si el socket está vivo, disparamos por WS y retornamos
      if (chatSocket.isConnected) {
        chatSocket.emit(event, payload);
        return;
      }

      // Si no hay socket pero nos pasaron un fallback HTTP, lo usamos
      if (httpFallback) {
        console.warn(
          `[Fallback] Socket desconectado. Usando HTTP para: ${event}`,
        );
        return await httpFallback();
      }

      // Si no hay socket ni fallback, mostramos error y lanzamos excepción para que el llamador lo maneje
      console.error(
        `No se pudo emitir ${event}: Socket desconectado y no hay fallback HTTP.`,
      );
      throw new Error("Sin conexión");
    },
    [],
  );
}
