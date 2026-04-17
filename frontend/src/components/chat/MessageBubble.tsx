import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2, X, Check } from "lucide-react";
import type { ChatMessage } from "@/shared/chat.schemas";
import { useEditMessage, useDeleteMessage } from "@/hooks/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  room: string;
}

export function MessageBubble({
  message,
  isOwnMessage,
  room,
}: Readonly<MessageBubbleProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  // Instanciamos los hooks de mutación
  const { mutate: editMessage, isPending: isEditingPending } =
    useEditMessage(room);
  const { mutate: deleteMessage, isPending: isDeletingPending } =
    useDeleteMessage(room);

  const handleSave = () => {
    // Solo disparamos la mutación si el contenido realmente cambió y no está vacío
    if (editContent.trim() !== message.content && editContent.trim() !== "") {
      editMessage({
        id: message.id!,
        updateData: { content: editContent.trim() },
        username: message.username,
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Guardar con Enter (sin Shift para permitir saltos de línea)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    // Cancelar con Escape
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  return (
    <motion.div
      layout // Animamos si la lista de mensajes cambia de tamaño o posición
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "group relative flex w-full mb-4",
        isOwnMessage ? "justify-end" : "justify-start",
      )}
    >
      {/* Menú flotante de acciones (Solo visible en hover para los mensajes del usuario) */}
      {isOwnMessage && !isEditing && (
        <div className="absolute top-0 -translate-y-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-neutral-800 border border-neutral-700 rounded-md p-1 shadow-lg z-10">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isDeletingPending}
            className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-700/50 rounded transition-colors cursor-pointer"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              deleteMessage({ id: message.id!, username: message.username })
            }
            disabled={isDeletingPending}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-700/50 rounded transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        className={clsx(
          "max-w-[75%] px-4 py-3 rounded-2xl shadow-sm flex flex-col gap-1 transition-all overflow-hidden",
          isOwnMessage
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-neutral-800 text-neutral-100 rounded-bl-sm border border-neutral-700/50",
          // Feedback visual rápido si se está eliminando (Optimistic Update previo)
          isDeletingPending && "opacity-50 scale-95 blur-[1px]",
        )}
      >
        {/* Solo mostramos el nombre si es el mensaje de otra persona */}
        {!isOwnMessage && (
          <span className="text-xs font-semibold text-indigo-400">
            {message.username}
          </span>
        )}

        {isEditing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2 mt-1 min-w-50"
          >
            <textarea
              autoFocus
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-black/20 text-white placeholder-white/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={isEditingPending || !editContent.trim()}
                className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word prose prose-sm prose-invert max-w-none [&>p]:my-0 [&>p:not(:last-child)]:mb-2 [&_pre]:my-2 [&_pre]:bg-black/30 [&_code]:bg-black/20 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-indigo-300 [&_a]:underline-offset-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

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
