import clsx from "clsx";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { ChatMessage } from "@/shared/chat.schemas";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageBubble({
  message,
  isOwnMessage,
}: Readonly<MessageBubbleProps>) {
  return (
    <motion.div
      layout // Animamos si la lista de mensajes cambia de tamaño o posición
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "flex w-full mb-4",
        isOwnMessage ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={clsx(
          "max-w-[75%] px-4 py-3 rounded-2xl shadow-sm flex flex-col gap-1",
          isOwnMessage
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-neutral-800 text-neutral-100 rounded-bl-sm border border-neutral-700/50",
        )}
      >
        {/* Solo mostramos el nombre si es el mensaje de otra persona */}
        {!isOwnMessage && (
          <span className="text-xs font-semibold text-indigo-400">
            {message.username}
          </span>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {message.content}
        </p>

        <span className="text-[10px] text-white/50 self-end mt-1 uppercase tracking-wider">
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </span>
      </div>
    </motion.div>
  );
}
