import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '../config/config.service';
import { JwtPayload } from './jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  @InjectRepository(User)
  private userRepository: Repository<User>;

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {
    const jwtConfig = this.configService.getJwtConfig();
    this.accessSecret = jwtConfig.jwtSecret;
    this.accessExpiresIn = jwtConfig.jwtExpiration;
    this.refreshSecret = jwtConfig.jwtRefreshSecret;
    this.refreshExpiresIn = jwtConfig.jwtRefreshExpiration;
  }

	private async hashPassword(password: string): Promise<string> {
		const saltRounds = 10;
		return bcrypt.hash(password, saltRounds);
	}

	private async comparePassword(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	private async signToken(payload: JwtPayload): Promise<string> {
		const options: JwtSignOptions = {
			secret: this.accessSecret,
			expiresIn: this.accessExpiresIn as JwtSignOptions['expiresIn'],
		};
		return this.jwtService.sign(payload, options);
	}

	async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
		if (existing) {
			throw new ConflictException('Email already in use');
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await this.hashPassword(dto.password);

		const user = this.userRepository.create({
			name: dto.name,
			email: dto.email,
			password: hashedPassword,
			salt,
			role: UserRole.USER,
		});

		const savedUser = await this.userRepository.save(user);

		const payload: JwtPayload = {
			username: savedUser.email,
			sub: savedUser.id as unknown as number,
			role: savedUser.role,
		};

		const accessToken = await this.signToken(payload);

		return {
			accessToken,
			user: {
				id: savedUser.id,
				name: savedUser.name,
				email: savedUser.email,
				role: savedUser.role,
			},
		};
	}

	async validateUser(email: string, password: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { email } });
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isValid = await this.comparePassword(password, user.password);
		if (!isValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		return user;
	}

	async login(dto: LoginDto) {
		const user = await this.validateUser(dto.email, dto.password);

		const payload: JwtPayload = {
			username: user.email,
			sub: user.id as unknown as number,
			role: user.role,
		};

		const accessToken = await this.signToken(payload);

		return {
			accessToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		};
	}
}
