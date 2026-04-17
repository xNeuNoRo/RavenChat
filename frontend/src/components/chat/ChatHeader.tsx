import { LogOut } from "lucide-react";
import { useChatParams } from "@/hooks/shared/useChatParams";
import { chatSocket } from "@/lib/SocketClient";

interface ChatHeaderProps {
  room: string;
  username: string;
}

export default function ChatHeader({
  room,
  username,
}: Readonly<ChatHeaderProps>) {
  const { clearChatParams } = useChatParams();

  const handleLogout = () => {
    // Limpiamos los parámetros de la URL para "desconectar" al usuario y luego desconectamos el socket
    clearChatParams();
    chatSocket.disconnect();
  };

  return (
    <header className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center shrink-0">
      <div>
        <h1 className="text-lg font-bold text-neutral-100">Sala: {room}</h1>
        <p className="text-xs text-indigo-400">Conectado como @{username}</p>
      </div>

      <button
        onClick={handleLogout}
        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
        title="Salir de la sala"
      >
        <span className="hidden sm:inline">Salir</span>
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}
