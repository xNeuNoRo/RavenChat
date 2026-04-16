import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseParams,
  Version,
} from "@neunoro/fastify-kit";
import { ChatService } from "../../providers/services/ChatService";
import { ChatMessage } from "../../domain/entities/ChatMessage.entity";
import {
  MessageLimitParamsSchema,
  MessageParamsSchema,
} from "../dtos/MessageParams.dto";
import { UserActivityStats } from "../../domain/projections/UserActivityStats";
import {
  CreateMessageDto,
  CreateMessageSchema,
} from "../dtos/CreateMessage.dto";
import {
  UpdateMessageDto,
  UpdateMessageSchema,
} from "../dtos/UpdateMessage.dto";

@Controller("/chat")
@Version("1")
export class ChatController {
  @Inject(ChatService)
  private readonly _chatService!: ChatService;

  @Get("/", {
    querystring: MessageLimitParamsSchema,
  })
  @UseParams(Query("limit"))
  public async getHistory(limit?: number): Promise<ChatMessage[]> {
    return await this._chatService.getChatHistory(limit);
  }

  @Get("/stats")
  public async getStats(): Promise<UserActivityStats[]> {
    return await this._chatService.getTopUsers();
  }

  @Get("/:id", {
    params: MessageParamsSchema,
  })
  @UseParams(Param("id"))
  public async getMessageById(id: string): Promise<ChatMessage> {
    return await this._chatService.getMessageById(id);
  }

  @Post("/", {
    body: CreateMessageSchema,
  })
  public async sendMessage(dto: CreateMessageDto): Promise<ChatMessage> {
    return await this._chatService.sendMessage(dto);
  }

  @Patch("/:id", {
    params: MessageParamsSchema,
    body: UpdateMessageSchema,
  })
  @UseParams(Param("id"), Body(), Headers("x-username"))
  public async editMessage(
    id: string,
    dto: UpdateMessageDto,
    username: string,
  ): Promise<ChatMessage> {
    return await this._chatService.editMessage(id, dto, username);
  }

  @Delete("/:id", {
    params: MessageParamsSchema,
  })
  @UseParams(Param("id"), Headers("x-username"))
  public async deleteMessage(id: string, username: string): Promise<void> {
    await this._chatService.deleteMessage(id, username);
  }
}
