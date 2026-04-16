import { Module } from "@neunoro/fastify-kit";
import { ChatController } from "./application/controllers/ChatController";
import { ChatGateway } from "./application/gateways/ChatGateway";
import { ChatService } from "./providers/services/ChatService";
import { ChatRepository } from "./providers/repositories/ChatRepository";

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
