import { useState, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { useSendMessage } from "@/hooks/chat";
import { chatSocket } from "@/lib/SocketClient";
import { ChatInboundEvent } from "@/shared/chat.events";
import { useDebounce } from "@/hooks/shared/useDebounce";

interface ChatInputProps {
  room: string;
  username: string;
}

export function ChatInput({ room, username }: Readonly<ChatInputProps>) {
  const [content, setContent] = useState("");
  // Debounce para detectar pausas en la escritura y emitir el evento de "dejó de escribir" después de 1s sin cambios
  const debouncedContent = useDebounce(content, 1000);
  const { mutate: sendMessage, isPending } = useSendMessage(room);

  // Manejamos el cambio en el input para actualizar el estado local y emitir el evento de "está escribiendo"
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setContent(val);

    // Si hay texto, avisamos que está escribiendo. Si lo borró rápido, avisamos que no.
    chatSocket.emit(ChatInboundEvent.TYPING, {
      username,
      isTyping: val.length > 0,
    });
  };

  // Efecto para detectar cuando el usuario deja de escribir
  // (debouncedContent se actualiza después de 1s sin cambios)
  useEffect(() => {
    // Si el valor debounced se actualiza y no está vacío, significa que hubo
    // una pausa de 1s en la escritura. Emitimos false.
    if (debouncedContent.length > 0) {
      chatSocket.emit(ChatInboundEvent.TYPING, { username, isTyping: false });
    }
  }, [debouncedContent, username]);

  // Manejamos el envío del formulario para enviar el mensaje
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    sendMessage({ username, content });
    setContent("");

    // Al enviar, forzamos que dejamos de escribir
    chatSocket.emit(ChatInboundEvent.TYPING, { username, isTyping: false });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-neutral-900 border-t border-neutral-800 flex gap-2 items-center"
    >
      <input
        type="text"
        value={content}
        onChange={handleTyping}
        onBlur={() => {
          window.scrollTo(0, 0);
        }}
        placeholder="Escribe un mensaje..."
        className="flex-1 bg-neutral-950 text-neutral-100 placeholder-neutral-500 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border border-neutral-800"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!content.trim() || isPending}
        className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <SendHorizontal className="w-5 h-5" />
      </button>
    </form>
  );
}
