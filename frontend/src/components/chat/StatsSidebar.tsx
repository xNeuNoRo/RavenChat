import { motion } from "framer-motion";
import { useChatStats } from "@/hooks/chat";
import { BarChart3, X, Trophy, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface StatsSidebarProps {
  onClose: () => void;
}

export function StatsSidebar({ onClose }: Readonly<StatsSidebarProps>) {
  const { data: stats, isLoading } = useChatStats();

  // Calculamos el máximo de mensajes para la barra de progreso proporcional
  const maxMessages = stats?.[0]?.totalMessages ?? 1;

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="fixed right-0 top-0 h-full w-80 bg-neutral-900 border-l border-neutral-800 shadow-2xl z-50 flex flex-col"
    >
      {/* Header del Panel */}
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
        <div className="flex items-center gap-2 text-indigo-400">
          <BarChart3 className="w-5 h-5" />
          <h2 className="font-bold text-white uppercase tracking-tight">Estadísticas</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-full bg-neutral-800 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          stats?.map((user, index) => (
            <div key={user.username} className="group flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                  <span className="text-sm font-semibold text-neutral-200">
                    @{user.username}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-400 font-mono">
                  <MessageSquare className="w-3 h-3" />
                  {user.totalMessages}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.totalMessages / maxMessages) * 100}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>

              <span className="text-[10px] text-neutral-500 uppercase">
                Visto {formatDistanceToNow(new Date(user.lastMessageAt), { addSuffix: true, locale: es })}
              </span>
            </div>
          ))
        )}

        {stats?.length === 0 && (
          <p className="text-center text-sm text-neutral-500 mt-10">
            No hay actividad registrada aún.
          </p>
        )}
      </div>
    </motion.aside>
  );
}