import { useEffect, useRef, type RefObject } from "react";

/**
 * @description Hook para manejar el scroll inteligente en un contenedor de chat.
 * Solo hace scroll automático si el usuario ya se encuentra cerca del final.
 */
export function useChatScroll<T>(
  dep: T,
  threshold = 150,
): RefObject<HTMLDivElement | null> {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Calculamos si el usuario está cerca del final
    // scrollHeight (total) - scrollTop (lo que bajó) - clientHeight (lo que ve)
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;

    if (isAtBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [dep, threshold]); // Se dispara cada vez que la dependencia (mensajes) cambie

  return scrollRef;
}
