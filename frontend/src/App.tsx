import { useChatParams } from "@/hooks/shared/useChatParams";
import { Login } from "@/components/auth/Login";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  // Consumimos el hook que gestiona el estado en la URL
  const { username, room, updateChatParams, isConnected } = useChatParams();

  return (
    <div className="h-screen w-full bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="chat-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            {/* Pasamos los valores de la URL al Layout del Chat */}
            <ChatLayout username={username} room={room} />
          </motion.div>
        ) : (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex items-center justify-center p-4"
          >
            {/* Pasamos la función updateChatParams como onJoin */}
            <Login
              onJoin={(name, selectedRoom) =>
                updateChatParams({ username: name, room: selectedRoom })
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
