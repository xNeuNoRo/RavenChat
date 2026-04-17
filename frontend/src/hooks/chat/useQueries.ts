import { getHistory, getMessageById, getStats } from "@/api/ChatAPI";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";

/**
 * @description Hook para obtener el historial de mensajes del chat.
 * @param room La sala de chat de la cual se obtendrán los mensajes (utilizado para aislar la cache).
 * @param limit Opcional. La cantidad máxima de mensajes a recuperar desde la API.
 * @returns Un objeto con la información de la consulta, incluyendo los datos, el estado de carga y cualquier error.
 */
export function useChatMessages(room: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.chat.messages.list(room),
    queryFn: () => getHistory(limit),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * @description Hook para obtener las estadísticas generales de actividad de los usuarios en el chat.
 * @returns Un objeto con la información de la consulta, incluyendo los datos de estadísticas, el estado de carga y cualquier error.
 */
export function useChatStats() {
  return useQuery({
    queryKey: queryKeys.chat.stats.all,
    queryFn: () => getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * @description Hook para obtener los detalles de un mensaje específico por su ID.
 * @param id El ID del mensaje que se desea obtener (ej. "ChatMessages/00001-A"). La consulta solo se ejecutará si el ID es válido (no nulo o indefinido).
 * @returns Un objeto con la información de la consulta, incluyendo los datos del mensaje, el estado de carga y cualquier error.
 */
export function useChatMessage(id?: string) {
  // Aseguramos que el ID sea una cadena válida para evitar errores en la consulta
  const validId = id ?? "";

  return useQuery({
    queryKey: queryKeys.chat.messages.detail(validId),
    queryFn: () => getMessageById(validId),
    enabled: !!id, // Solo ejecutar la consulta si el ID es válido y fue proporcionado
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
}

/**
 * @description Hook para leer la lista de usuarios que están escribiendo en una sala.
 * Es un estado puramente local alimentado por el WebSocket.
 * @param room La sala de chat actual para saber qué caché leer.
 * @returns Un array de strings con los nombres de usuario que están escribiendo actualmente en la sala.
 * Si no hay nadie escribiendo, devuelve un array vacío.
 */
export function useChatTyping(room: string) {
  const { data } = useQuery({
    queryKey: queryKeys.chat.typing(room),
    staleTime: Infinity, // Nunca caduca, el socket decide cuándo limpiarlo
  });

  return data || [];
}
