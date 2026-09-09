import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Post()
  create(@Body() body: { name: string; email: string; message: string }) {
    return this.service.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}
