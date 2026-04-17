import {
  ChatInboundEvent,
  ChatOutboundEvent,
  type ChatInboundPayloads,
  type ChatOutboundPayloads,
  type WsFrame,
} from "../shared/chat.events";

type Handler<T> = (data: T) => void;

export class SocketClient {
  private socket: WebSocket | null = null;
  private readonly handlers = new Map<
    ChatOutboundEvent,
    Array<(data: unknown) => void>
  >();
  private reconnectTimer: number | null = null;
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * @description Establece la conexión WebSocket y configura los handlers de eventos.
   */
  public connect() {
    // Si ya estamos conectados, no hacemos nada
    if (this.socket?.readyState === WebSocket.OPEN) return;

    // Configuración básica del WebSocket nativo
    this.socket = new WebSocket(this.url);

    // Handler para mensajes entrantes
    this.socket.onmessage = (msg) => {
      try {
        const { event, data }: WsFrame = JSON.parse(msg.data);
        // Ejecutamos todos los handlers suscritos a este evento
        // Tipo pub/sub simple
        this.handlers
          .get(event as ChatOutboundEvent)
          ?.forEach((handler) => handler(data));
      } catch (e) {
        console.error("Mensaje de WebSocket mal formado:", e);
      }
    };

    // Handler para reconexión automática
    this.socket.onclose = () => {
      console.warn(
        "WebSocket desconectado, intentando reconectar en 3 segundos...",
      );
      this.reconnectTimer = globalThis.setTimeout(() => this.connect(), 3000);
    };
  }

  /**
   * @description Permite suscribirse a eventos específicos del chat con un handler.
   * @param event El evento al que queremos suscribirnos (definido en ChatOutboundEvent)
   * @param handler La función que se ejecutará cuando llegue un mensaje de ese evento.
   * @return Una función de limpieza que, al ejecutarse, desuscribe el handler del evento.
   */
  public on<OutboundEvent extends ChatOutboundEvent>(
    event: OutboundEvent,
    handler: Handler<ChatOutboundPayloads[OutboundEvent]>,
  ) {
    // Si no hay handlers para este evento, inicializamos el array
    if (!this.handlers.has(event)) this.handlers.set(event, []);

    // Envolvemos el handler para asegurar el tipo correcto (aunque sea en tiempo de ejecución)
    const wrappedHandler = (data: unknown) =>
      handler(data as ChatOutboundPayloads[OutboundEvent]);

    // Obtenemos el array de handlers para este evento
    const handlers = this.handlers.get(event);

    // Si el array existe, añadimos el nuevo handler; si no, lo creamos con el handler inicial
    if (handlers) {
      handlers.push(wrappedHandler);
    } else {
      this.handlers.set(event, [wrappedHandler]);
    }

    // Devolvemos una función de limpieza
    return () => {
      const current = this.handlers.get(event) || [];
      this.handlers.set(
        event,
        // Para desuscribir, simplemente filtramos el handler específico del array
        current.filter((h) => h !== wrappedHandler),
      );
    };
  }

  /**
   * @description Permite enviar mensajes al servidor WebSocket con un evento específico y su payload.
   * @param event El evento que queremos emitir (definido en ChatInboundEvent)
   * @param data El payload asociado a ese evento, con la forma definida en ChatInboundPayloads.
   */
  public emit<InboundEvent extends ChatInboundEvent>(
    event: InboundEvent,
    data: ChatInboundPayloads[InboundEvent],
  ) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }

  /**
   * @description Cierra la conexión WebSocket y limpia todos los handlers registrados.
   */
  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.handlers.clear();
  }
}

// URL del WebSocket definida en las variables de entorno (VITE_WS_URL)
const WS_URL = import.meta.env.VITE_CHAT_WS_URL;
// Exportamos una instancia singleton del SocketClient en el url definido para el chat
export const chatSocket = new SocketClient(`${WS_URL}/chat`);
