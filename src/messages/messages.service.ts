import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message} from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly templateRepo: Repository<Message>,
  ) {}

  async create(dto: CreateMessageDto): Promise<Message> {
    const template = this.templateRepo.create(dto);
    return this.templateRepo.save(template);
  }

  async findAll(): Promise<Message[]> {
    return this.templateRepo.find();
  }

  async findOne(id: number): Promise<Message | null> {
    return this.templateRepo.findOneBy({ id });
  }

  async update(id: number, dto: UpdateMessageDto): Promise<Message | null> {
    await this.templateRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.templateRepo.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}
