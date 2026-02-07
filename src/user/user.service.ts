import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole, UserSelectOptions } from './entities/user.entity';
import { Visit } from '../visit/entities/visit.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
  ) {}

  async createEmployee(createUserDto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepo.create({
      name: createUserDto.name,
      email: createUserDto.email,
      phone: createUserDto.phone,
      password: hashedPassword,
      salt,
      role: UserRole.EMPLOYEE,
    });

    const saved = await this.userRepo.save(user);
    const { password, salt: _salt, ...safe } = saved;
    return safe;
  }

  async assignUserToVisit(userId: string, visitId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const visit = await this.visitRepo.findOne({ where: { id: visitId }, relations: ['users'] });
    if (!visit) throw new NotFoundException('Visit not found');

    // clear other active visits for this user
    const otherActive = await this.visitRepo.find({ where: { isActive: true, users: { id: user.id } } });
    for (const other of otherActive) {
      other.isActive = false;
      await this.visitRepo.save(other);
    }

    if (!visit.users) {
      (visit as any).users = [];
    }
    if (!visit.users.find((u) => u.id === user.id)) {
      visit.users.push(user);
    }
    visit.isActive = true;
    visit.isCompleted = false;
    await this.visitRepo.save(visit);

    user.currentVisit = visit;
    await this.userRepo.save(user);

    return visit;
  }

  async joinVisitForUser(userId: string, visitId: string) {
    return this.assignUserToVisit(userId, visitId);
  }

  async getEmployeeUsernames(prefix?: string) {
    const where = prefix
      ? [
        { role: UserRole.EMPLOYEE, name: Like(`${prefix}%`) },
        { role: UserRole.EMPLOYEE, email: Like(`${prefix}%`) },
      ]
      : { role: UserRole.EMPLOYEE };

    const users = await this.userRepo.find({
      where,
      select: ['id', 'name', 'email'],
    });
    return users;
  }

  async getCurrentVisitForUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.currentVisit) {
      return null;
    }

    const visit = await this.visitRepo.findOne({
      where: { id: user.currentVisit.id },
      relations: ['family', 'aidDistributions'],
      select: UserSelectOptions,
    });
    return visit;
  }
}
