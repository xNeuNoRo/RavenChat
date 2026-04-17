import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { ChatMessage } from "@/shared/chat.schemas";
import {
  ChatOutboundEvent,
  type ChatOutboundPayloads,
} from "@/shared/chat.events";
import { toast } from "sonner";

/**
 * @description Diccionario de estrategias para manejar los eventos entrantes del WebSocket.
 * Muta la caché de React Query directamente sin involucrar a los componentes de UI.
 */
export const chatEventStrategies = {
  [ChatOutboundEvent.MESSAGE_CREATED]: (
    queryClient: QueryClient,
    room: string,
    data: ChatOutboundPayloads[typeof ChatOutboundEvent.MESSAGE_CREATED],
  ) => {
    const listKey = queryKeys.chat.messages.list(room);
    queryClient.setQueryData(listKey, (oldData: ChatMessage[] | undefined) => {
      if (!oldData) return [data];
      // Evitamos duplicados si el Optimistic Update ya lo había agregado
      if (oldData.some((msg) => msg.id === data.id)) return oldData;
      return [...oldData, data];
    });
  },

  [ChatOutboundEvent.MESSAGE_UPDATED]: (
    queryClient: QueryClient,
    room: string,
    data: ChatOutboundPayloads[typeof ChatOutboundEvent.MESSAGE_UPDATED],
  ) => {
    const listKey = queryKeys.chat.messages.list(room);

    // Actualizamos la lista
    queryClient.setQueryData(listKey, (oldData: ChatMessage[] | undefined) => {
      if (!oldData) return undefined;
      return oldData.map((msg) =>
        msg.id === data.id ? { ...msg, ...data } : msg,
      );
    });

    // Actualizamos el item individual si está en caché
    if (data.id) {
      queryClient.setQueryData(queryKeys.chat.messages.detail(data.id), data);
    }
  },

  [ChatOutboundEvent.MESSAGE_DELETED]: (
    queryClient: QueryClient,
    room: string,
    data: ChatOutboundPayloads[typeof ChatOutboundEvent.MESSAGE_DELETED],
  ) => {
    const listKey = queryKeys.chat.messages.list(room);
    queryClient.setQueryData(listKey, (oldData: ChatMessage[] | undefined) => {
      if (!oldData) return undefined;
      return oldData.filter((msg) => msg.id !== data.id);
    });
  },

  // Guardamos quién escribe en la key de React Query
  [ChatOutboundEvent.USER_TYPING_BROADCAST]: (
    queryClient: QueryClient,
    room: string,
    data: ChatOutboundPayloads[typeof ChatOutboundEvent.USER_TYPING_BROADCAST],
  ) => {
    const typingKey = queryKeys.chat.typing(room);
    queryClient.setQueryData(typingKey, (oldData: string[] = []) => {
      if (data.isTyping) {
        return oldData.includes(data.username)
          ? oldData
          : [...oldData, data.username];
      } else {
        return oldData.filter((u) => u !== data.username);
      }
    });
  },

  [ChatOutboundEvent.ERROR]: (
    _queryClient: QueryClient,
    _room: string,
    data: ChatOutboundPayloads[typeof ChatOutboundEvent.ERROR],
  ) => {
    console.error(`[WS Server Error] ${data.code}: ${data.message}`);
    toast.error(`Ha ocurrido un error en el servidor`, {
      duration: 5000,
    });
  },
};
