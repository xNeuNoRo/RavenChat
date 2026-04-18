import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function RelativeTime({ date }: { readonly date: string | Date }) {
  // Solo usamos este estado para forzar el re-render de este pequeño <span>
  const [, setTick] = useState(0);

  useEffect(() => {
    // Actualizamos el estado cada minuto para que el componente se vuelva a renderizar y así actualizar el tiempo relativo mostrado
    const interval = setInterval(() => setTick((t) => t + 1), 60000);

    // Limpiamos el intervalo al desmontar el componente para evitar memory leaks
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es,
      })}
    </>
  );
}
