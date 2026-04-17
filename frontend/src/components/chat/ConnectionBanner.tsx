import { useEffect, useState } from "react";
import { chatSocket } from "@/lib/SocketClient";
import { Loader2, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ConnectionBanner() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Nos suscribimos al estado del socket
    const unsubscribe = chatSocket.onConnectionChange((status) => {
      setIsConnected(status);
    });

    // Limpiamos la suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500/10 border-b border-amber-500/20 overflow-hidden shrink-0"
        >
          <div className="px-4 py-2.5 flex items-center justify-center gap-2 text-amber-500 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Reconectando con el servidor...</span>
            <WifiOff className="w-4 h-4 ml-2 opacity-50" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
