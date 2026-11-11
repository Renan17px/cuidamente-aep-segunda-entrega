import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { testarConexao } from './config/database';
import { rotas } from './routes';
import { middlewareDeErro } from './middlewares/erros';

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/api', rotas);
app.use('/api', (_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Se o front-end já foi compilado (npm run build), a própria API o serve.
const pastaFront = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(path.join(pastaFront, 'index.html'))) {
  app.use(express.static(pastaFront));
  app.get('*', (_req, res) => res.sendFile(path.join(pastaFront, 'index.html')));
}

app.use(middlewareDeErro);

async function iniciar(): Promise<void> {
  try {
    await testarConexao();
    console.log(`[banco] Conectado ao MySQL em ${env.db.host}:${env.db.porta}/${env.db.nome}`);
  } catch (erro) {
    const codigo = (erro as { code?: string }).code ?? (erro as Error).message;
    console.error(`[banco] Não foi possível conectar ao MySQL (${codigo}).`);
    console.error('        Verifique o arquivo src/backend/.env e se o MySQL está rodando.');
    console.error('        Para criar o banco: npm run db:init');
    process.exit(1);
  }
  app.listen(env.porta, () => {
    console.log(`[api] CuidaMente rodando em http://localhost:${env.porta}`);
  });
}

void iniciar();
