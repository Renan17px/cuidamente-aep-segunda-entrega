import mysql, { Pool } from 'mysql2/promise';
import { env } from './env';

/**
 * Pool de conexões ATIVAS com o MySQL.
 * dateStrings mantém DATE e TIME como texto ('2026-11-10', '08:30:00'),
 * evitando conversões de fuso horário entre Windows, Linux e macOS.
 */
export const pool: Pool = mysql.createPool({
  host: env.db.host,
  port: env.db.porta,
  user: env.db.usuario,
  password: env.db.senha,
  database: env.db.nome,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  charset: 'utf8mb4',
});

export async function testarConexao(): Promise<void> {
  const conexao = await pool.getConnection();
  try {
    await conexao.ping();
  } finally {
    conexao.release();
  }
}
