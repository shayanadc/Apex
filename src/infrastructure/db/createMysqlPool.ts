import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { z } from 'zod';

const DbEnvSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
});

export function createMysqlPool(): Pool {
  const env = DbEnvSchema.parse(process.env);

  return mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });
}
