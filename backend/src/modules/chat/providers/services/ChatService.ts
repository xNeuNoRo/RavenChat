import {
  ClearCache,
  EVENT_BUS_TOKEN,
  EventBusContract,
  ForbiddenException,
  getEventBus,
  Inject,
  Injectable,
  NotFoundException,
  requestContext,
} from "@neunoro/fastify-kit";
import { ChatRepository } from "../repositories/ChatRepository";
import { IDocumentSession } from "ravendb";
import { CreateMessageDto } from "../../application/dtos/CreateMessage.dto";
import { ChatMessage } from "../../domain/entities/ChatMessage.entity";
import { UserActivityStats } from "../../domain/projections/UserActivityStats";
import { UpdateMessageDto } from "../../application/dtos/UpdateMessage.dto";
import { ChatOutboundEvent } from "../../domain/events/ChatEvents";

@Injectable()
export class ChatService {
  @Inject(ChatRepository)
  private readonly chatRepository!: ChatRepository;

  // Obtenemos el event bus para emitir eventos al gateway desde el servicio
  private get _eventBus(): EventBusContract {
    return getEventBus();
  }

  private get session(): IDocumentSession {
    return requestContext.get("dbSession");
  }

  public async getMessageById(id: string): Promise<ChatMessage> {
    const message = await this.chatRepository.getById(id);
    if (!message) {
      throw new NotFoundException("mensaje", id);
    }
    return message;
  }

  @ClearCache("chat") // Limpiamos el cache de chat cada vez que se envia un nuevo mensaje
  public async sendMessage(dto: CreateMessageDto): Promise<ChatMessage> {
    const message = ChatMessage.create(dto.username, dto.content);
    await this.chatRepository.save(message);
    await this.session.saveChanges();
    // Le emitimos el evento al gateway para que lo reenvie a los clientes conectados
    this._eventBus.emit(ChatOutboundEvent.MESSAGE_CREATED, message);
    return message;
  }

  @ClearCache("chat") // Limpiamos el cache de chat cada vez que se edita un mensaje
  public async editMessage(
    id: string,
    dto: UpdateMessageDto,
    currentUsername: string,
  ): Promise<ChatMessage> {
    const message = await this.chatRepository.getById(id);

    if (!message) throw new NotFoundException("mensaje", id);
    if (message.username !== currentUsername)
      throw new ForbiddenException("No puedes editar este mensaje");

    message.updateContent(dto.content);
    await this.chatRepository.save(message);
    await this.session.saveChanges();
    // Le emitimos el evento al gateway para que lo reenvie a los clientes conectados
    this._eventBus.emit(ChatOutboundEvent.MESSAGE_UPDATED, message);
    return message;
  }

  @ClearCache("chat") // Limpiamos el cache de chat cada vez que se borra un mensaje
  public async deleteMessage(
    id: string,
    currentUsername: string,
  ): Promise<void> {
    const message = await this.chatRepository.getById(id);
    if (!message) {
      throw new NotFoundException("mensaje", id);
    }

    if (message.username !== currentUsername) {
      throw new ForbiddenException(
        "No tienes permiso para borrar este mensaje.",
      );
    }

    await this.chatRepository.delete(id);
    await this.session.saveChanges();
    // Le emitimos el evento al gateway para que lo reenvie a los clientes conectados
    this._eventBus.emit(ChatOutboundEvent.MESSAGE_DELETED, { id });
  }

  public async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    return await this.chatRepository.getRecent(limit);
  }

  public async getTopUsers(): Promise<UserActivityStats[]> {
    return await this.chatRepository.getActiveUsersStats();
  }
}
