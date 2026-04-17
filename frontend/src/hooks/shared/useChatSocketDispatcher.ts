import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatSocket } from "@/lib/SocketClient";
import { chatEventStrategies } from "@/api/chatEventStrategies";
import {
  ChatOutboundEvent,
  type ChatOutboundPayloads,
} from "@/shared/chat.events";

/**
 * @description Hook orquestador que escucha los eventos del WebSocket nativo
 * y delega la lógica de actualización al mapa de estrategias.
 * @param room La sala actual, necesaria para saber qué parte de la caché actualizar.
 */
export function useChatSocketDispatcher(room: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Nos aseguramos de conectar el socket al montar el dispatcher
    chatSocket.connect();

    // Extraemos los valores del enum para suscribirnos a todos los eventos definidos
    const events = Object.values(ChatOutboundEvent) as ChatOutboundEvent[];

    // Nos suscribimos a cada evento y guardamos las funciones de limpieza para el unbind
    const unbinders = events.map((event) => {
      return chatSocket.on(
        event,
        (payload: ChatOutboundPayloads[typeof event]) => {
          const strategy = chatEventStrategies[event] as (
            qc: typeof queryClient,
            room: string,
            p: typeof payload,
          ) => void;

          if (strategy) {
            strategy(queryClient, room, payload);
          }
        },
      );
    });

    // Limpiamos las suscripciones al desmontar el componente
    return () => {
      unbinders.forEach((unbind) => unbind());
    };
  }, [queryClient, room]);
}
