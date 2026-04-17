import { useMemo } from "react";
import { useChatMessages, useChatTyping } from "@/hooks/chat";
import { useChatSocketDispatcher } from "@/hooks/shared/useChatSocketDispatcher";
import { useChatScroll } from "@/hooks/shared/useChatScroll";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import ChatHeader from "./ChatHeader";

interface ChatLayoutProps {
  room: string;
  username: string;
}

export function ChatLayout({ room, username }: Readonly<ChatLayoutProps>) {
  // Activamos el listener global del WebSocket para esta sala
  useChatSocketDispatcher(room);

  // Traemos los datos de la caché (que el Dispatcher actualizará automáticamente)
  const { data: messages, isLoading } = useChatMessages(room, 100);
  const typingUsers = useChatTyping(room);
  const typingUsersList: string[] = useMemo(
    () =>
      Array.isArray(typingUsers)
        ? typingUsers.filter((u): u is string => typeof u === "string")
        : [],
    [typingUsers],
  );

  // Integramos el hook de scroll inteligente
  const scrollRef = useChatScroll([messages, typingUsersList]);

  // Filtramos al propio usuario de la lista de "escribiendo"
  const othersTyping = typingUsersList.filter((u) => u !== username);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950 text-indigo-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Header */}
      <ChatHeader room={room} username={username} />

      {/* Área de Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
          <AnimatePresence mode="popLayout">
            {messages?.map((msg) => (
              <MessageBubble
                key={msg.id} // En un Optimistic Update temporal, el ID debe existir
                message={msg}
                isOwnMessage={msg.username === username}
              />
            ))}
          </AnimatePresence>

          {/* Indicador de escribiendo */}
          {othersTyping.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-neutral-500 italic mb-4 ml-4"
            >
              {othersTyping.join(", ")}{" "}
              {othersTyping.length === 1 ? "está" : "están"} escribiendo...
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 max-w-3xl w-full mx-auto">
        <ChatInput room={room} username={username} />
      </div>
    </div>
  );
}
