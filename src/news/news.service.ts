import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService implements OnModuleInit {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async onModuleInit() {
    const count = await this.newsRepository.count();
    if (count === 0) {
      // Create dates slightly in the past
      const now = new Date();
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 3600000);
      const yesterday = new Date(now.getTime() - 24 * 3600000);

      await this.newsRepository.save([
        { content: 'New volunteer joined!', createdAt: fiveMinsAgo },
        { content: '25 families received aid', createdAt: twoHoursAgo },
        { content: 'North region visit completed', createdAt: yesterday },
      ]);
    }
  }

  create(createNewsDto: CreateNewsDto) {
    const news = this.newsRepository.create(createNewsDto);
    return this.newsRepository.save(news);
  }

  findAll() {
    return this.newsRepository.find({ order: { createdAt: 'DESC' } });
  }
}
