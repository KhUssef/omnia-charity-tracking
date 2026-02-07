import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';

async function main() {
	const app = await NestFactory.createApplicationContext(AppModule);
	try {
		const userService = app.get(UserService);

		// Read admin data from CLI args or use sensible defaults
		// Usage: npm run create:admin -- name email password [phone]
		const [, , nameArg, emailArg, passwordArg, phoneArg] = process.argv;
		const name = nameArg || 'Admin';
		const email = emailArg || 'admin@example.com';
		const password = passwordArg || 'admin123';
		const phone = phoneArg;

		// Reuse the employee creation logic but override the role to ADMIN afterwards
		const created = await (userService as any).createEmployee({
			name,
			email,
			password,
			phone,
		});

		// Promote the created user to ADMIN role
		const repo = (userService as any).userRepo as import('typeorm').Repository<any>;
		const user = await repo.findOne({ where: { email } });
		if (user) {
			user.role = UserRole.ADMIN;
			await repo.save(user);
			console.log('Admin user created/updated:', { id: user.id, email: user.email, role: user.role });
		} else {
			console.log('User was not found after creation.');
		}
	} catch (err) {
		console.error('Failed to create admin user:', err);
	} finally {
		await app.close();
	}

}

main().catch(err => {
	console.error('Unexpected error:', err);
	process.exit(1);
});
