/**
 * Cria o banco e as tabelas executando database/schema.sql e database/seed.sql.
 * Uso: npm run db:init   (dispensa ter o cliente "mysql" instalado no terminal)
 */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

async function executar(): Promise<void> {
  const pastaDatabase = path.resolve(__dirname, '..', '..', '..', '..', 'database');
  const arquivos = ['schema.sql', 'seed.sql'];

  const conexao = await mysql.createConnection({
    host: env.db.host,
    port: env.db.porta,
    user: env.db.usuario,
    password: env.db.senha,
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    for (const arquivo of arquivos) {
      let sql = fs.readFileSync(path.join(pastaDatabase, arquivo), 'utf8');
      // Permite usar um nome de banco diferente definido no .env
      if (env.db.nome !== 'cuidamente') {
        sql = sql
          .replace('CREATE DATABASE IF NOT EXISTS cuidamente', `CREATE DATABASE IF NOT EXISTS \`${env.db.nome}\``)
          .replace('USE cuidamente;', `USE \`${env.db.nome}\`;`);
      }
      await conexao.query(sql);
      console.log(`[db:init] ${arquivo} executado.`);
    }
    console.log(`[db:init] Banco "${env.db.nome}" pronto. Admin: admin@cuidamente.com / admin123`);
  } finally {
    await conexao.end();
  }
}

executar().catch((erro: Error & { code?: string }) => {
  console.error(`[db:init] Falhou: ${erro.code ?? ''} ${erro.message}`);
  process.exit(1);
});
