import { useEffect } from "react";
import { chatSocket } from "../../api/SocketClient";
import {
  ChatOutboundEvent,
  type ChatOutboundPayloads,
} from "../../shared/chat.events";

/**
 * @description Hook funcional para suscribirse a un evento del socket.
 * Se encarga de limpiar la suscripción cuando el componente muere.
 * Basicamente evita el boilerplate 24/7 de usar el useEffect con la subscripcion al evento.
 */
export function useSocketEvent<OutboundEvent extends ChatOutboundEvent>(
  event: OutboundEvent,
  callback: (data: ChatOutboundPayloads[OutboundEvent]) => void,
) {
  // Usamos useEffect para re-ejecutar en cada render si el evento o el callback cambian
  useEffect(() => {
    // Nos suscribimos al evento usando el método on del SocketClient
    const unbind = chatSocket.on(event, callback);
    // Devolvemos la función de limpieza que se ejecutará al desmontar el componente
    return () => unbind();
  }, [event, callback]);
}
