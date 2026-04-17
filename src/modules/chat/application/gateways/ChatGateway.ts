import {
  FastifyKitSocket,
  HttpException,
  Inject,
  LOGGER_TOKEN,
  LoggerContract,
  OnConnect,
  OnDisconnect,
  requestContext,
  SubscribeMessage,
  WebSocketGateway,
  WsBroadcaster,
} from "@neunoro/fastify-kit";
import { ChatService } from "../../providers/services/ChatService";
import { RavenDbService } from "@/infrastructure/database/RavenDbService";
import {
  ChatInboundEvent,
  ChatInboundPayloads,
  ChatOutboundEvent,
  WsResponse,
} from "../../domain/events/ChatEvents";
import { ChatMessage } from "../../domain/entities/ChatMessage.entity";

@WebSocketGateway({ path: "/chat" })
export class ChatGateway {
  @Inject(LOGGER_TOKEN)
  private readonly logger!: LoggerContract;

  @Inject(ChatService)
  private readonly _chatService!: ChatService;

  @Inject(WsBroadcaster)
  private readonly _broadcaster!: WsBroadcaster;

  @OnConnect()
  public handleConnection(client: FastifyKitSocket) {
    this.logger.info(`[🟢 ChatGateway] Cliente conectado: ${client.id}`);
  }

  @OnDisconnect()
  public handleDisconnect(client: FastifyKitSocket) {
    this.logger.info(`[🔴 ChatGateway] Cliente desconectado: ${client.id}`);
  }

  /**
   * @description funcion de utilidad para ejecutar cualquier operacion que necesite acceso a la base de datos de RavenDB
   * @param client socket del cliente que realiza la operacion, se utiliza para inyectar el requestId en el contexto de la request y asi poder rastrear las operaciones en los logs de RavenDB
   * @param operation funcion asincrona que contiene la logica de la operacion a ejecutar, esta funcion se ejecutara dentro del contexto de la request para que tenga acceso a la sesion de RavenDB inyectada en el contexto
   * @returns el resultado de la operacion ejecutada
   */
  private async withDbSession<T>(
    client: FastifyKitSocket,
    operation: () => Promise<WsResponse<T>>,
  ): Promise<WsResponse<T>> {
    const session = RavenDbService.store.openSession();

    // Creamos un Map para almacenar la sesion de RavenDB
    // y cualquier otro dato que queramos compartir en el contexto de la request
    const store = new Map<string, any>();

    // Inyectamos la sesion de RavenDB
    store.set("dbSession", session);

    // Reutilizamos el id del socket como requestId
    if (client?.id) {
      store.set("requestId", client.id);
    }

    // Ejecutamos la operacion dentro del contexto de la request para que la sesion
    // de RavenDB este disponible en cualquier parte del codigo que se ejecute dentro de esta funcion
    return requestContext.run(store, async () => {
      try {
        return await operation();
      } catch (error: any) {
        this.logger.error(
          `[🔴 ChatGateway Error | RequestId: ${client?.id}]`,
          error,
        );

        const isControlledError = error instanceof HttpException;

        return {
          status: "error",
          message: isControlledError
            ? error.message
            : "Error interno al procesar la solicitud",
        };
      } finally {
        session.dispose(); // Liberamos memoria de RavenDB
      }
    });
  }

  /**
   * @description Handler que se ejecuta al recibir el evento de nuevo mensaje
   */
  @SubscribeMessage(ChatInboundEvent.SEND_MESSAGE)
  public async onNewMessage(
    client: FastifyKitSocket,
    payload: ChatInboundPayloads[ChatInboundEvent.SEND_MESSAGE],
  ): Promise<WsResponse<ChatMessage>> {
    // Ejecutamos la logica de enviar un mensaje dentro del contexto
    // de la request para que tenga acceso a la sesion de RavenDB
    return this.withDbSession(client, async () => {
      const savedMessage = await this._chatService.sendMessage(payload);

      this._broadcaster.emitToRoom(
        "/chat",
        "general",
        ChatOutboundEvent.MESSAGE_CREATED,
        savedMessage,
      );

      return { status: "ok", data: savedMessage };
    });
  }

  /**
   * @description Handler que se ejecuta al recibir el evento de editar mensaje
   */
  @SubscribeMessage(ChatInboundEvent.UPDATE_MESSAGE)
  public async onEditMessage(
    client: FastifyKitSocket,
    payload: ChatInboundPayloads[ChatInboundEvent.UPDATE_MESSAGE],
  ): Promise<WsResponse<ChatMessage>> {
    return this.withDbSession(client, async () => {
      const updatedMessage = await this._chatService.editMessage(
        payload.params.id,
        payload.body,
        payload.currentUsername,
      );

      this._broadcaster.emitToRoom(
        "/chat",
        "general",
        ChatOutboundEvent.MESSAGE_UPDATED,
        updatedMessage,
      );

      return { status: "ok", data: updatedMessage };
    });
  }

  /**
   * @description Handler que se ejecuta al recibir el evento de eliminar mensaje
   */
  @SubscribeMessage(ChatInboundEvent.DELETE_MESSAGE)
  public async onDeleteMessage(
    client: FastifyKitSocket,
    payload: ChatInboundPayloads[ChatInboundEvent.DELETE_MESSAGE],
  ): Promise<WsResponse<{ id: string }>> {
    return this.withDbSession(client, async () => {
      await this._chatService.deleteMessage(
        payload.params.id,
        payload.currentUsername,
      );

      this._broadcaster.emitToRoom(
        "/chat",
        "general",
        ChatOutboundEvent.MESSAGE_DELETED,
        { id: payload.params.id },
      );

      return { status: "ok", data: { id: payload.params.id } };
    });
  }

  @SubscribeMessage(ChatInboundEvent.TYPING)
  public async onTyping(
    _client: FastifyKitSocket,
    payload: ChatInboundPayloads[ChatInboundEvent.TYPING],
  ): Promise<WsResponse> {
    this._broadcaster.emitToRoom(
      "/chat",
      "general",
      ChatOutboundEvent.USER_TYPING_BROADCAST,
      {
        username: payload.username,
        isTyping: payload.isTyping,
      },
    );

    return { status: "ok" };
  }
}
