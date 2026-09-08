import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

// Supporte à la fois les variables custom (DATABASE_*) et celles de Railway/MySQL (MYSQL*)
const host = process.env.DATABASE_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost';
const port = parseInt(process.env.DATABASE_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10);
const username = process.env.DATABASE_USERNAME || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root';
const password = process.env.DATABASE_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'root';
const database = process.env.DATABASE_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'omnia';

export default new DataSource({
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '**', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
});
