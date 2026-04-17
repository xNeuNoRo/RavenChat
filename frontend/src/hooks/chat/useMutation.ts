import { deleteMessage, editMessage, sendMessage } from "@/api/ChatAPI";
import { queryKeys } from "@/lib/queryKeys";
import type {
  ChatMessage,
  CreateMessageDto,
  UpdateMessageDto,
} from "@/shared/chat.schemas";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * @description Función auxiliar para actualizar un mensaje en la caché de consultas después de crearlo o actualizarlo en el servidor.
 * Busca en la lista de la sala específica y en los detalles individuales para mantenernos sincronizado.
 */
const updateMessageInCache = (
  queryClient: QueryClient,
  data: ChatMessage,
  room: string,
) => {
  // Actualizamos el detalle individual del mensaje (Pessimistic Update)
  if (data.id) {
    queryClient.setQueryData(
      queryKeys.chat.messages.detail(data.id),
      (oldData: ChatMessage | undefined) => {
        if (!oldData) return data;
        return { ...oldData, ...data };
      },
    );
  }

  // Actualizamos la lista de mensajes de la sala
  const listKey = queryKeys.chat.messages.list(room);
  queryClient.setQueryData(listKey, (oldData: ChatMessage[] | undefined) => {
    if (!oldData) return [data];

    const messageExists = oldData.some((msg) => msg.id === data.id);

    if (messageExists) {
      // Si el mensaje ya existe (edición), lo actualizamos
      return oldData.map((msg) =>
        msg.id === data.id ? { ...msg, ...data } : msg,
      );
    } else {
      // Si no existe (creación), lo agregamos al final (asumiendo orden cronológico)
      return [...oldData, data];
    }
  });

  // Invalidamos todas las queries base del chat para sincronizar estadísticas y otros posibles datos
  queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
};

/**
 * @description Hook para enviar un nuevo mensaje. Utiliza React Query para manejar el estado y hace una actualización pesimista (Pessimistic Update) para inyectarlo en la caché apenas el servidor responda.
 * @param room La sala de chat actual para saber qué caché actualizar.
 * @returns Un objeto con la información de la mutación.
 */
export function useSendMessage(room: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData: CreateMessageDto) => sendMessage(messageData),
    onSuccess: (data) => {
      updateMessageInCache(queryClient, data, room);
    },
    onError: (error) => {
      // Mostramos el mensaje de error si el envío falla (ej. validaciones del servidor)
      toast.error(error.message || "Error al enviar el mensaje");
    },
  });
}

/**
 * @description Hook para editar el contenido de un mensaje. Realiza una actualización en caché para reflejar el cambio al instante.
 * @param room La sala de chat actual.
 * @returns Un objeto con la información de la mutación.
 */
export function useEditMessage(room: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updateData,
      username,
    }: {
      id: string;
      updateData: UpdateMessageDto;
      username: string;
    }) => editMessage(id, updateData, username),
    onSuccess: (data) => {
      // Feedback sutil de edición
      toast.success("Mensaje editado");

      // Actualizamos la tarea en la caché para que la edición se vea inmediatamente
      updateMessageInCache(queryClient, data, room);
    },
    onError: (error) => {
      toast.error(error.message || "Error al editar el mensaje");
    },
  });
}

/**
 * @description Hook para eliminar un mensaje. Utiliza un Optimistic Update: elimina el mensaje de la UI antes de que el servidor responda, y si hay error, revierte la caché a su estado original (Rollback).
 * @param room La sala de chat actual.
 * @returns Un objeto con la mutación y la función para ejecutarla.
 */
export function useDeleteMessage(room: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, username }: { id: string; username: string }) =>
      deleteMessage(id, username),
    onMutate: async ({ id }) => {
      // Cancelamos cualquier consulta en curso relacionada con el chat para evitar que sobreescriban nuestra caché optimista
      await queryClient.cancelQueries({ queryKey: queryKeys.chat.all });

      const listKey = queryKeys.chat.messages.list(room);

      // Guardamos el estado previo para poder hacer Rollback si falla
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(listKey);

      // Hacemos el Optimistic Update: filtramos el mensaje eliminado de la caché inmediatamente
      queryClient.setQueryData(
        listKey,
        (oldData: ChatMessage[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((msg) => msg.id !== id);
        },
      );

      // Retornamos el contexto con los datos previos
      return { previousMessages, listKey };
    },
    onSuccess: () => {
      toast.success("Mensaje eliminado");
    },
    onSettled: () => {
      // onSettled se ejecuta sin importar el resultado.
      // Invalidamos para que la caché se reconcilie con la base de datos (RavenDB).
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
    onError: (error, _variables, context) => {
      toast.error(error.message || "No se pudo eliminar el mensaje");

      // Rollback: Si la mutación falló, restauramos los mensajes a como estaban antes
      if (context?.previousMessages) {
        queryClient.setQueryData(context.listKey, context.previousMessages);
      }
    },
  });
}
