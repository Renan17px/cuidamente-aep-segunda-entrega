import path from 'path';
import dotenv from 'dotenv';

// Carrega src/backend/.env independentemente da pasta de onde o comando é executado.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env'), quiet: true } as dotenv.DotenvConfigOptions);

function lerTexto(nome: string, padrao: string): string {
  const valor = process.env[nome];
  return valor === undefined || valor === '' ? padrao : valor;
}

export const env = {
  porta: Number(lerTexto('PORT', '3333')),
  db: {
    host: lerTexto('DB_HOST', '127.0.0.1'),
    porta: Number(lerTexto('DB_PORT', '3306')),
    usuario: lerTexto('DB_USER', 'root'),
    senha: process.env.DB_PASSWORD ?? '',
    nome: lerTexto('DB_NAME', 'cuidamente'),
  },
  jwtSegredo: lerTexto('JWT_SECRET', 'cuidamente-segredo-de-desenvolvimento'),
  jwtExpiracao: lerTexto('JWT_EXPIRES_IN', '8h'),
};

if (env.jwtSegredo === 'cuidamente-segredo-de-desenvolvimento' || env.jwtSegredo === 'troque-este-segredo') {
  console.warn('[aviso] JWT_SECRET padrão em uso. Defina um valor próprio no arquivo .env.');
}
