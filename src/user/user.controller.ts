import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';
import { ConnectedUser } from '../auth/decorators/user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Admin creates an employee user
  @Roles([UserRole.ADMIN])
  @Post()
  createEmployee(@Body() createUserDto: CreateUserDto) {
    return this.userService.createEmployee(createUserDto);
  }

  // Admin assigns any user to a visit
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN])
  @Post(':userId/assign-visit/:visitId')
  assignUserToVisit(@Param('userId') userId: string, @Param('visitId') visitId: string) {
    return this.userService.assignUserToVisit(userId, visitId);
  }

  // Current authenticated user joins a visit
  @UseGuards(JwtAuthGuard)
  @Roles([UserRole.EMPLOYEE])
  @Post('me/join-visit/:visitId')
  joinVisit(
    @ConnectedUser() user: JwtPayload,
    @Param('visitId') visitId: string,
  ) {
    return this.userService.joinVisitForUser(user.sub, visitId);
  }

  // Get employee usernames for autocomplete
  @UseGuards(JwtAuthGuard)
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN])
  @Get('employees/usernames')
  getEmployeeUsernames(@Query('q') q?: string) {
    return this.userService.getEmployeeUsernames(q);
  }

  // Get current visit for the authenticated user
  @UseGuards(JwtAuthGuard)
  @Roles([UserRole.EMPLOYEE])
  @Get('me/current-visit')
  getMyCurrentVisit(@ConnectedUser() user: JwtPayload) {
    return this.userService.getCurrentVisitForUser(user.sub);
  }
}
