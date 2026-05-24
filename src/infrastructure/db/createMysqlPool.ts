import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

export function createMysqlPool(): Pool {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const;
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}
