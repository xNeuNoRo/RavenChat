/**
 * @description Factory de keys para React Query.
 */
export const queryKeys = {
  chat: {
    // La llave base para lo que sea relacionado con el chat
    all: ["chat"] as const,

    // Llaves para las listas de mensajes, opcionalmente filtradas por sala
    messages: {
      all: ["chat", "messages"] as const,
      list: (room: string) => ["chat", "messages", "list", { room }] as const,
      detail: (id: string) => ["chat", "messages", "detail", { id }] as const,
    },

    // Llaves para las estadísticas de usuario
    stats: {
      all: ["chat", "stats"] as const,
      byUser: (username: string) =>
        ["chat", "stats", "user", { username }] as const,
    },

    // Llave para el estado de quién está escribiendo en cada sala (efímero, no viene de la API)
    typing: (room: string) => ["chat", "typing", { room }] as const,
  },

  user: {
    profile: (username: string) => ["user", "profile", { username }] as const,
  },
} as const;

// Tipado de ayuda para inferir las llaves si es necesario
export type QueryKeys = typeof queryKeys;
