import { handleApiError } from "@/helpers/handleApiError";
import { validateApiRes } from "@/helpers/validateApiRes";
import { api } from "@/lib/axios";
import {
  type ChatMessage,
  ChatMessageSchema,
  ChatMessagesSchema,
  type CreateMessageDto,
  type UpdateMessageDto,
  type UserActivityStats,
  UserActivityStatsArraySchema,
} from "@/shared/chat.schemas";

// Recurso de la API para el chat
const RESOURCE = "/chat";

// ==============================================
// Funciones básicas del CRUD para el Chat
// ==============================================

/**
 * @description Obtiene el historial de mensajes desde la API, valida la respuesta y maneja errores
 * @param limit Opcional. Cantidad máxima de mensajes a recuperar
 * @returns Una promesa que resuelve con un array de mensajes validados o rechaza con un error manejado
 */
export async function getHistory(limit?: number): Promise<ChatMessage[]> {
  try {
    // Realiza la solicitud GET al recurso de mensajes
    const { data } = await api.get(RESOURCE, {
      params: limit ? { limit } : undefined,
    });
    // Valida la respuesta de la API contra el esquema de array de mensajes y devuelve los datos validados
    return validateApiRes(data, ChatMessagesSchema);
  } catch (err) {
    // Maneja cualquier error que ocurra durante la solicitud o validación
    handleApiError(err);
  }
}

/**
 * @description Obtiene las estadísticas de los usuarios más activos desde la API, valida la respuesta y maneja errores
 * @returns Una promesa que resuelve con un array de estadísticas validadas o rechaza con un error manejado
 */
export async function getStats(): Promise<UserActivityStats[]> {
  try {
    // Realiza la solicitud GET al recurso de estadísticas
    const { data } = await api.get(`${RESOURCE}/stats`);
    // Valida la respuesta de la API contra el esquema de array de estadísticas y devuelve los datos validados
    return validateApiRes(data, UserActivityStatsArraySchema);
  } catch (err) {
    // Maneja cualquier error que ocurra durante la solicitud o validación
    handleApiError(err);
  }
}

/**
 * @description Obtiene un mensaje específico por su ID desde la API, valida la respuesta y maneja errores
 * @param id El ID del mensaje a obtener (ej. "ChatMessages/00001-A")
 * @returns Una promesa que resuelve con el mensaje validado o rechaza con un error manejado
 */
export async function getMessageById(id: string): Promise<ChatMessage> {
  try {
    // Codificamos el id ya que en ravenDB los IDs contienen caracteres especiales como "/" 
    // que obviamente no se pueden usar crudamente en urls
    const safeId = encodeURIComponent(id);
    // Realiza la solicitud GET al recurso de mensajes con el ID específico
    const { data } = await api.get(`${RESOURCE}/${safeId}`);
    // Valida la respuesta de la API contra el esquema de mensaje y devuelve los datos validados
    return validateApiRes(data, ChatMessageSchema);
  } catch (err) {
    // Maneja cualquier error que ocurra durante la solicitud o validación
    handleApiError(err);
  }
}

/**
 * @description Crea un nuevo mensaje vía REST, valida la respuesta y maneja errores
 * @param messageData Los datos del nuevo mensaje a crear, debe cumplir con CreateMessageDto
 * @returns Una promesa que resuelve con el mensaje creado y validado o rechaza con un error manejado
 */
export async function sendMessage(
  messageData: CreateMessageDto,
): Promise<ChatMessage> {
  try {
    // Realiza la solicitud POST al recurso de mensajes
    const { data } = await api.post(RESOURCE, messageData);
    // Valida la respuesta de la API contra el esquema de mensaje y devuelve los datos validados
    return validateApiRes(data, ChatMessageSchema);
  } catch (err) {
    // Maneja cualquier error que ocurra durante la solicitud o validación
    handleApiError(err);
  }
}

/**
 * @description Actualiza el contenido de un mensaje existente, valida la respuesta y maneja errores
 * @param id El ID exacto del documento en RavenDB
 * @param updateData Los datos de actualización, debe cumplir con UpdateMessageDto
 * @param username El usuario actual (requerido por el backend para validación de propiedad)
 * @returns Una promesa que resuelve con el mensaje actualizado y validado o rechaza con un error manejado
 */
export async function editMessage(
  id: string,
  updateData: UpdateMessageDto,
  username: string,
): Promise<ChatMessage> {
  try {
    // Es crítico codificar el ID en RavenDB porque contiene barras diagonales (/)
    const safeId = encodeURIComponent(id);
    // Realiza la solicitud PATCH al recurso de mensajes con el header requerido
    const { data } = await api.patch(`${RESOURCE}/${safeId}`, updateData, {
      headers: {
        "x-username": encodeURIComponent(username),
      },
    });
    // Valida la respuesta de la API contra el esquema de mensaje y devuelve los datos validados
    return validateApiRes(data, ChatMessageSchema);
  } catch (err) {
    // Maneja cualquier error que ocurra durante la solicitud o validación
    handleApiError(err);
  }
}

/**
 * @description Elimina un mensaje específico por su ID desde la API, y maneja errores
 * @param id El ID del mensaje a eliminar
 * @param username El usuario actual (requerido por el backend para validación)
 * @returns Una promesa que resuelve con void o rechaza con un error manejado
 */
export async function deleteMessage(
  id: string,
  username: string,
): Promise<void> {
  try {
    // Es crítico codificar el ID en RavenDB porque contiene barras diagonales (/)
    const safeId = encodeURIComponent(id);
    // Realiza la solicitud DELETE al recurso de mensajes con el header requerido
    await api.delete(`${RESOURCE}/${safeId}`, {
      headers: {
        "x-username": encodeURIComponent(username),
      },
    });
  } catch (err) {
    // Maneja cualquier error que ocurra durante la solicitud
    handleApiError(err);
  }
}
