export class CreateMessageDto {
    title!: string;
    body!: string;
    type?: 'SMS' | 'WhatsApp' | 'Email' | 'Telegram';
  }
  