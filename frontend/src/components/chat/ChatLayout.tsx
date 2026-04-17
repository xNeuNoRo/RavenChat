import { useMemo, useState } from "react";
import { useChatMessages, useChatTyping } from "@/hooks/chat";
import { useChatSocketDispatcher } from "@/hooks/shared/useChatSocketDispatcher";
import { useChatScroll } from "@/hooks/shared/useChatScroll";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import ChatHeader from "./ChatHeader";
import { ConnectionBanner } from "./ConnectionBanner";
import { StatsSidebar } from "./StatsSidebar";
import { UserAvatar } from "./UserAvatar";
import { TypingIndicator } from "./TypingIndicator";

interface ChatLayoutProps {
  room: string;
  username: string;
}

export function ChatLayout({ room, username }: Readonly<ChatLayoutProps>) {
  const [showStats, setShowStats] = useState(false);

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
      <div className="h-dvh flex items-center justify-center bg-neutral-950 text-indigo-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-neutral-950 overflow-hidden">
      {/* Header */}
      <ChatHeader
        room={room}
        username={username}
        onOpenStats={() => setShowStats(true)}
      />

      {/* Banner de conexión */}
      <ConnectionBanner />

      {/* Área de Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-y-contain p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
          <AnimatePresence mode="popLayout">
            {messages?.map((msg) => (
              <MessageBubble
                key={msg.id} // En un Optimistic Update temporal, el ID debe existir
                message={msg}
                isOwnMessage={msg.username === username}
                room={room}
              />
            ))}
          </AnimatePresence>

          {/* Indicador de escribiendo */}
          <AnimatePresence>
            {othersTyping.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: 0.15 },
                }}
                transition={{ duration: 0.2 }}
                className="flex items-end gap-2 mb-4 mt-2"
              >
                {/* Mostramos el avatar del primer usuario que esté escribiendo */}
                <UserAvatar username={othersTyping[0]} />

                <div className="flex flex-col gap-1">
                  {/* Burbuja que contiene los 3 puntos animando */}
                  <div className="px-3 py-2.5 bg-neutral-900 rounded-2xl rounded-bl-none border border-neutral-800/50 w-fit">
                    <TypingIndicator />
                  </div>

                  {/* Texto descriptivo sutil */}
                  <span className="text-[11px] text-neutral-500 font-medium px-1">
                    {othersTyping.length === 1
                      ? `${othersTyping[0]} está escribiendo...`
                      : `${othersTyping.join(", ")} están escribiendo...`}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 max-w-3xl w-full mx-auto">
        <ChatInput room={room} username={username} />
      </div>

      <AnimatePresence>
        {showStats && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStats(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <StatsSidebar onClose={() => setShowStats(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
