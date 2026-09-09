import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly repo: Repository<ContactMessage>,
  ) {}

  async create(data: { name: string; email: string; message: string }) {
    const msg = this.repo.create(data);
    await this.repo.save(msg);
    return { success: true, id: msg.id };
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: string) {
    await this.repo.update(id, { isRead: true });
    return { success: true };
  }
}
