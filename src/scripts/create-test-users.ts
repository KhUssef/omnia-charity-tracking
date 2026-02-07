import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function main() {
	const app = await NestFactory.createApplicationContext(AppModule);
	try {
		const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

		const usersToCreate: Array<{
			name: string;
			email: string;
			password: string;
			phone?: string;
			role: 'EMPLOYEE' | 'USER';
		}> = [
			{
				name: 'Employee One',
				email: 'employee1@example.com',
				password: 'password1',
				phone: '+10000000001',
				role: 'EMPLOYEE',
			},
			{
				name: 'Employee Two',
				email: 'employee2@example.com',
				password: 'password2',
				phone: '+10000000002',
				role: 'EMPLOYEE',
			},
			{
				name: 'Employee Three',
				email: 'employee3@example.com',
				password: 'password3',
				phone: '+10000000003',
				role: 'EMPLOYEE',
			},
			{
				name: 'Normal User',
				email: 'user@example.com',
				password: 'userpass',
				phone: '+10000000004',
				role: 'USER',
			},
		];

		for (const cfg of usersToCreate) {
			let user = await userRepo.findOne({ where: { email: cfg.email } });
			if (user) {
				console.log(`User already exists, skipping: ${cfg.email}`);
				continue;
			}

			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(cfg.password, salt);

			user = userRepo.create({
				name: cfg.name,
				email: cfg.email,
				phone: cfg.phone,
				password: hashedPassword,
				salt,
				role: cfg.role as any,
			});

			const saved = await userRepo.save(user);
			console.log('Created user:', {
				id: saved.id,
				email: saved.email,
				role: saved.role,
			});
		}
	} catch (err) {
		console.error('Failed to create test users:', err);
	} finally {
		await app.close();
	}
}

main().catch((err) => {
	console.error('Unexpected error:', err);
	process.exit(1);
});
