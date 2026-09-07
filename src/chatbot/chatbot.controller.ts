import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  chat(
    @Body('message') message: string,
    @Body('history') history?: { role: string; content: string }[],
  ) {
    return this.chatbotService.chat(message, history);
  }
}
