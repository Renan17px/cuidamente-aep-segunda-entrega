import { Router } from 'express';
import { tratarAsync } from '../middlewares/erros';
import { autenticar, exigirPermissao } from '../middlewares/autenticacao';
import { testarConexao } from '../config/database';
import { AuthController } from '../controllers/AuthController';
import { UsuarioController } from '../controllers/UsuarioController';
import { TriagemController } from '../controllers/TriagemController';
import { LembreteController } from '../controllers/LembreteController';
import { RecursoController } from '../controllers/RecursoController';

const auth = new AuthController();
const usuarios = new UsuarioController();
const triagens = new TriagemController();
const lembretes = new LembreteController();
const recursos = new RecursoController();

export const rotas = Router();

// Saúde da API + teste de conexão com o banco
rotas.get(
  '/health',
  tratarAsync(async (_req, res) => {
    await testarConexao();
    res.json({ status: 'ok', banco: 'conectado' });
  }),
);

// Autenticação (Create de usuário)
rotas.post('/auth/cadastro', tratarAsync((req, res) => auth.cadastrar(req, res)));
rotas.post('/auth/login', tratarAsync((req, res) => auth.login(req, res)));

// Usuários
rotas.get('/usuarios/me', autenticar, tratarAsync((req, res) => usuarios.perfil(req, res)));
rotas.put('/usuarios/me', autenticar, tratarAsync((req, res) => usuarios.atualizarPerfil(req, res)));
rotas.delete('/usuarios/me', autenticar, tratarAsync((req, res) => usuarios.excluirConta(req, res)));
rotas.get('/usuarios', autenticar, exigirPermissao('GERENCIAR_USUARIOS'), tratarAsync((req, res) => usuarios.listar(req, res)));
rotas.delete('/usuarios/:id', autenticar, exigirPermissao('GERENCIAR_USUARIOS'), tratarAsync((req, res) => usuarios.excluir(req, res)));

// Triagens (entidade principal)
rotas.get('/triagens/questionarios', tratarAsync((req, res) => triagens.questionarios(req, res)));
rotas.get('/triagens/questionarios/:tipo', tratarAsync((req, res) => triagens.questionario(req, res)));
rotas.get('/triagens/resumo', autenticar, tratarAsync((req, res) => triagens.resumo(req, res)));
rotas.get('/triagens', autenticar, tratarAsync((req, res) => triagens.listar(req, res)));
rotas.post('/triagens', autenticar, exigirPermissao('REALIZAR_TRIAGEM'), tratarAsync((req, res) => triagens.criar(req, res)));
rotas.get('/triagens/:id', autenticar, tratarAsync((req, res) => triagens.buscar(req, res)));
rotas.put('/triagens/:id', autenticar, tratarAsync((req, res) => triagens.atualizar(req, res)));
rotas.delete('/triagens/:id', autenticar, tratarAsync((req, res) => triagens.excluir(req, res)));

// Lembretes
rotas.get('/lembretes', autenticar, tratarAsync((req, res) => lembretes.listar(req, res)));
rotas.post('/lembretes', autenticar, tratarAsync((req, res) => lembretes.criar(req, res)));
rotas.get('/lembretes/:id', autenticar, tratarAsync((req, res) => lembretes.buscar(req, res)));
rotas.put('/lembretes/:id', autenticar, tratarAsync((req, res) => lembretes.atualizar(req, res)));
rotas.delete('/lembretes/:id', autenticar, tratarAsync((req, res) => lembretes.excluir(req, res)));

// Recursos de apoio (leitura pública; escrita apenas para administradores)
rotas.get('/recursos', tratarAsync((req, res) => recursos.listar(req, res)));
rotas.get('/recursos/filtros', tratarAsync((req, res) => recursos.filtros(req, res)));
rotas.get('/recursos/emergencia', tratarAsync((req, res) => recursos.emergencia(req, res)));
rotas.get('/recursos/:id', tratarAsync((req, res) => recursos.buscar(req, res)));
rotas.post('/recursos', autenticar, exigirPermissao('GERENCIAR_RECURSOS'), tratarAsync((req, res) => recursos.criar(req, res)));
rotas.put('/recursos/:id', autenticar, exigirPermissao('GERENCIAR_RECURSOS'), tratarAsync((req, res) => recursos.atualizar(req, res)));
rotas.delete('/recursos/:id', autenticar, exigirPermissao('GERENCIAR_RECURSOS'), tratarAsync((req, res) => recursos.excluir(req, res)));
