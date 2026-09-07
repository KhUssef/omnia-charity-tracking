import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async onModuleInit() {
    const count = await this.taskRepository.count();
    if (count === 0) {
      await this.taskRepository.save([
        { title: 'Review pending aid requests', completed: false },
        { title: 'Update family information', completed: true },
        { title: 'Schedule region visit', completed: false },
      ]);
    }
  }

  create(createTaskDto: CreateTaskDto) {
    const task = this.taskRepository.create(createTaskDto);
    return this.taskRepository.save(task);
  }

  findAll() {
    return this.taskRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.taskRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.taskRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.taskRepository.delete(id);
  }
}
