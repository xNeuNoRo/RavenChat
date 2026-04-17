interface ChatHeaderProps {
  room: string;
  username: string;
}

export default function ChatHeader({
  room,
  username,
}: Readonly<ChatHeaderProps>) {
  return (
    <header className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center shrink-0">
      <div>
        <h1 className="text-lg font-bold text-neutral-100">Sala: {room}</h1>
        <p className="text-xs text-indigo-400">Conectado como @{username}</p>
      </div>
    </header>
  );
}
