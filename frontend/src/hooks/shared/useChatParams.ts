import { useSearchParams } from "react-router-dom";
import { CHAT_ROOMS } from "../../shared/chat.rooms";

/**
 * @description Hook especializado para gestionar el estado estructural del chat (username y room)
 * directamente en la URL, permitiendo persistencia entre recargas.
 */
export const useChatParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Valores actuales extraídos de la URL con valores por defecto
  const username = searchParams.get("username") || "";
  const room = searchParams.get("room") || CHAT_ROOMS.GENERAL;

  /**
   * @description Actualiza los parámetros de búsqueda de forma atómica.
   * Si un valor es null, undefined o vacío, el parámetro se elimina de la URL.
   */
  const updateChatParams = (
    updates: Record<string, string | null | undefined>,
  ) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        });

        return newParams;
      },
      { replace: true }, // Mantenemos el historial limpio
    );
  };

  /**
   * @description Limpia todos los parámetros (útil para un "Logout")
   */
  const clearChatParams = () => {
    setSearchParams({}, { replace: true });
  };

  return {
    username,
    room,
    updateChatParams,
    clearChatParams,
    isConnected: !!username, // Helper para saber si el usuario ya "entró"
  };
};
