import pg from 'pg';
import 'dotenv/config';

// DATE (tipo 1082) como texto "AAAA-MM-DD", evitando erro de fuso horário
pg.types.setTypeParser(1082, (valor) => valor);

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});