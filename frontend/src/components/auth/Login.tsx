import { useState } from "react";
import { MessageSquareShare } from "lucide-react";
import { motion } from "framer-motion";

interface LoginProps {
  onJoin: (username: string, room: string) => void;
}

export function Login({ onJoin }: Readonly<LoginProps>) {
  const [username, setUsername] = useState("");
  // Fijamos la sala a "general" ya que solo hay una disponible de momento xd
  const room = "general";

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Limpiamos los inputs
    const cleanUsername = username.trim().replaceAll(/\s+/g, "");

    if (cleanUsername) {
      onJoin(cleanUsername, room);
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-8 text-center bg-neutral-800/50 border-b border-neutral-800">
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <MessageSquareShare className="w-8 h-8" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white">
          Bienvenido a RavenChat
        </h1>
        <p className="text-neutral-400 text-sm mt-2">
          Ingresa tus datos para unirte a la conversación
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-neutral-300 mb-1.5"
          >
            Nombre de Usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ej. angel_dev"
            className="w-full bg-neutral-950 text-white border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            autoComplete="off"
            required
            maxLength={20}
          />
        </div>

        <div>
          <label
            htmlFor="room"
            className="block text-sm font-medium text-neutral-300 mb-1.5"
          >
            Sala
          </label>
          <select
            id="room"
            value={room}
            disabled
            className="w-full bg-neutral-900 text-neutral-500 border border-neutral-800/50 rounded-lg px-4 py-3 cursor-not-allowed appearance-none focus:outline-none"
          >
            <option value="general">General (Única disponible)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!username.trim()}
          className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Entrar a la sala
        </button>
      </form>
    </div>
  );
}
