# CuidaMente – Plataforma Web de Triagem e Suporte em Saúde Mental

AEP do 4º semestre (2026.2) – Análise e Desenvolvimento de Sistemas – Unicesumar Maringá
**Equipe:** Gustavo Kenzo Iwakura, Lucas Eiki Uemura, Renan Negrini e Adriel Wanderlind

O CuidaMente aplica uma triagem de saúde mental em formato de chatbot (baseada nos instrumentos validados PHQ-9 e GAD-7), guarda o histórico do usuário, mostra a evolução em um gráfico, envia lembretes de autocuidado e direciona para canais de apoio gratuitos (CVV, CAPS, UBS). Quando o resultado é **Crise**, abre automaticamente um alerta com os contatos de emergência.

> A triagem é uma ferramenta de auto-observação e **não substitui avaliação profissional**.

## ODS da ONU

**ODS 3 – Saúde e Bem-Estar**, Meta 3.4: promover a saúde mental e o bem-estar. A plataforma funciona como ponte entre o cidadão e a rede pública de saúde mental, reduzindo barreiras de informação e de acesso.

---

## Lista de requisitos (escopo)

| Código | Requisito | Onde está implementado |
|---|---|---|
| RF01 | O sistema deve disponibilizar um chatbot interativo que aplique um questionário de triagem de saúde mental validado (baseado nos instrumentos PHQ-9 e GAD-7), classificando o resultado em níveis: Bem, Atenção ou Crise. | `TriagemDepressao`, `TriagemAnsiedade`, tela **Triagem** |
| RF02 | O sistema deve permitir o cadastro de usuários com nome, e-mail e senha, armazenando o histórico de todas as triagens realizadas para acompanhamento da evolução do bem-estar ao longo do tempo. | `AuthService`, `UsuarioRepository`, `TriagemRepository`, telas **Entrar** e **Minha conta** |
| RF03 | O sistema deve permitir que o usuário configure lembretes personalizados de autocuidado (meditação, hidratação, pausa do trabalho, atividade física), exibindo notificações na plataforma no horário definido. | `Lembrete`, `LembreteRepository`, tela **Lembretes**, componente `AlertasLembrete` |
| RF04 | O sistema deve exibir uma lista atualizada de canais de apoio psicológico gratuitos ou de baixo custo (CVV, CAPS, UBS, telepsicologia SUS), filtrável por tipo de serviço e localização. | `RecursoApoio`, `RecursoRepository`, telas **Canais de apoio** e **Recursos** (admin) |
| RF05 | O sistema deve apresentar ao usuário um painel visual com o histórico de triagens em gráfico de linha, indicando a evolução do seu estado ao longo das semanas. | `TriagemService.resumo`, tela **Painel** |
| RF06 | Caso a triagem identifique resultado CRISE, o sistema deve exibir automaticamente um modal de alerta com os contatos de emergência (CVV 188, SAMU 192 e CAPS da cidade do usuário). | `RecursoController.emergencia`, componente `ModalCrise` |

## Cronograma de execução

| Sprint / Data | Épico | User Story | Responsável |
|---|---|---|---|
| Sprint 1 · 28/09 – 05/10 | Autenticação | COMO UM usuário EU QUERO me cadastrar e fazer login PARA QUE meus dados e histórico sejam salvos com segurança. | Renan |
| Sprint 2 · 06/10 – 12/10 | Chatbot de Triagem | COMO UM usuário EU QUERO responder perguntas guiadas pelo chatbot PARA QUE eu possa entender meu estado emocional atual. | Adriel |
| Sprint 3 · 13/10 – 19/10 | Histórico e Dashboard | COMO UM usuário EU QUERO ver um gráfico com minhas triagens anteriores PARA QUE eu possa acompanhar minha evolução. | Lucas |
| Sprint 4 · 20/10 – 26/10 | Lembretes e Recursos | COMO UM usuário EU QUERO configurar lembretes e acessar canais de apoio PARA QUE eu mantenha uma rotina de autocuidado. | Gustavo |
| Sprint 5 · 27/10 – 02/11 | Modo Crise e Testes | COMO UM usuário em risco EU QUERO receber alertas de emergência imediatos PARA QUE eu possa acessar ajuda rapidamente. | Gustavo |

---

## Tecnologias

| Camada | Escolha | Por quê |
|---|---|---|
| Linguagem | **TypeScript** (Node.js + React) | Mesma pilha JavaScript definida na 1ª entrega, agora **tipada** e com a palavra-chave `override` obrigatória (`noImplicitOverride`) para o polimorfismo. |
| Back-end | Node.js 18+ · Express · API REST | Requisições assíncronas, ideal para o chatbot. |
| Banco | **MySQL 8** (driver `mysql2`) | Relacional, integridade referencial entre usuários, triagens e respostas. |
| Front-end | React 19 · Vite · Recharts | Interface componentizada e gráfico de linha do painel. |
| Segurança | bcrypt (hash de senha) · JWT (sessão) | Senhas nunca ficam em texto puro. |

A explicação completa da arquitetura e de onde cada pilar de POO aparece está em [`docs/arquitetura.md`](docs/arquitetura.md).

## Pilares de POO (resumo)

| Pilar | Onde |
|---|---|
| Classe abstrata | `Usuario`, `Triagem`, `RepositorioBase<T>` |
| Interface | `Avaliavel` (calcularNivel / calcularPontuacao), `Repositorio<T>` |
| Herança | `Paciente` e `Administrador` → `Usuario`; `TriagemDepressao` e `TriagemAnsiedade` → `Triagem`; 4 repositórios → `RepositorioBase` |
| Polimorfismo (`override`) | `calcularNivel()` com regra do PHQ-9 e do GAD-7; `getTipo()` / `getPermissoes()` de cada perfil; `mapearLinha()` de cada repositório |
| Composição 1:N | `Triagem` 1 ──◆ N `Resposta` (a triagem cria as próprias respostas; `ON DELETE CASCADE` no banco) |
| Encapsulamento | atributos `private` com getters/setters que validam os dados |

---

## Estrutura de pastas

```
cuidamente-aep/
├── database/
│   ├── schema.sql          # criação das tabelas (fiel ao DER)
│   └── seed.sql            # administrador padrão + canais de apoio
├── docs/
│   └── arquitetura.md      # arquitetura, classes, regras de pontuação, API
├── src/
│   ├── backend/            # API REST (Node.js + TypeScript)
│   │   └── src/
│   │       ├── models/         # classes de domínio (POO)
│   │       ├── repositories/   # CRUD no MySQL
│   │       ├── services/       # regras de negócio
│   │       ├── controllers/    # entrada/saída HTTP
│   │       ├── routes/         # mapeamento das rotas
│   │       ├── middlewares/    # autenticação e tratamento de erros
│   │       ├── config/         # .env e conexão com o banco
│   │       └── scripts/        # initDb (cria o banco)
│   └── frontend/           # Interface web (React + TypeScript)
│       └── src/
│           ├── pages/          # telas
│           └── components/     # layout, modal de crise, alertas
├── docker-compose.yml      # MySQL pronto via Docker (opcional)
└── package.json            # atalhos para instalar, rodar e compilar tudo
```

---

## Como executar

### Pré-requisitos (Windows, Linux ou macOS)

- **Node.js 18 ou superior** → https://nodejs.org (confira com `node -v`)
- **MySQL 8** instalado e rodando, **ou** Docker Desktop (opção B)
- Git

### 1. Clonar e instalar as dependências

```bash
git clone https://github.com/GustavoKenz0/cuidamente-aep.git
cd cuidamente-aep
npm run instalar
```

### 2. Configurar a conexão com o banco

Copie o arquivo de exemplo e preencha usuário e senha do seu MySQL:

```bash
# Linux / macOS / Git Bash
cp src/backend/.env.example src/backend/.env

# Windows (PowerShell)
Copy-Item src\backend\.env.example src\backend\.env
```

Edite `src/backend/.env` (o principal é `DB_USER` e `DB_PASSWORD`).

### 3. Criar o banco de dados

**Opção A – MySQL instalado na máquina:**

```bash
npm run db:init
```

O comando executa `database/schema.sql` e `database/seed.sql` (não precisa do cliente `mysql` no terminal). Também é possível rodar os dois arquivos manualmente no MySQL Workbench, nessa ordem.

**Opção B – Docker:**

```bash
docker compose up -d
```

Nesse caso use `DB_USER=root` e `DB_PASSWORD=cuidamente` no `.env`. As tabelas são criadas automaticamente na primeira subida.

### 4. Rodar

**Modo desenvolvimento** (API na porta 3333 + interface na 5173, com recarga automática):

```bash
npm run dev
```

Acesse **http://localhost:5173**

**Modo produção** (a própria API serve a interface compilada, uma porta só):

```bash
npm run build
npm start
```

Acesse **http://localhost:3333**

### Contas para teste

| Perfil | Como acessar |
|---|---|
| Paciente | Crie uma conta na tela inicial ("Criar conta") |
| Administrador | `admin@cuidamente.com` / `admin123` (troque a senha em "Minha conta") |

### Problemas comuns

Se a tela de login mostrar um erro, a mensagem diz a causa. Confira também o terminal: as linhas `[api]` mostram se o back-end conectou no banco.

| Mensagem | Solução |
|---|---|
| `A API não respondeu` | O back-end não está rodando. Use `npm run dev` na pasta raiz (sobe API e tela juntas) e veja o erro nas linhas `[api]`. |
| `Usuário ou senha do MySQL incorretos` | Ajuste `DB_USER` e `DB_PASSWORD` em `src/backend/.env` e reinicie o `npm run dev`. |
| `O banco "cuidamente" ainda não existe` | Rode `npm run db:init`. |
| `Não foi possível conectar ao MySQL (ECONNREFUSED)` | O MySQL não está rodando, ou a porta em `DB_PORT` está errada. Mantenha `DB_HOST=127.0.0.1` (no Windows, `localhost` pode falhar). |
| `ER_ACCESS_DENIED_ERROR` | Usuário/senha do `.env` incorretos. |
| `ER_BAD_DB_ERROR` | O banco ainda não foi criado: rode `npm run db:init`. |
| Porta 3333 ou 5173 em uso | Mude `PORT` no `.env` (e o proxy em `src/frontend/vite.config.ts`). |
| `npm` não reconhecido no Windows | Reinstale o Node.js marcando "Add to PATH" e reabra o terminal. |

Datas e horários são tratados como texto (`dateStrings`), então o sistema se comporta igual em Windows, Linux e macOS, sem conversões de fuso. O arquivo `.gitattributes` padroniza as quebras de linha (LF) entre os sistemas.

---

## API REST (resumo)

Todas as rotas começam com `/api`. As marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>`.

| Entidade | Create | Read | Update | Delete |
|---|---|---|---|---|
| Usuário | `POST /auth/cadastro` | `GET /usuarios/me` 🔒 · `GET /usuarios` 🔒admin | `PUT /usuarios/me` 🔒 | `DELETE /usuarios/me` 🔒 · `DELETE /usuarios/:id` 🔒admin |
| **Triagem** (principal) | `POST /triagens` 🔒 | `GET /triagens` 🔒 · `GET /triagens/:id` 🔒 · `GET /triagens/resumo` 🔒 | `PUT /triagens/:id` 🔒 (recalcula o nível) | `DELETE /triagens/:id` 🔒 |
| Lembrete | `POST /lembretes` 🔒 | `GET /lembretes` 🔒 · `GET /lembretes/:id` 🔒 | `PUT /lembretes/:id` 🔒 | `DELETE /lembretes/:id` 🔒 |
| Recurso | `POST /recursos` 🔒admin | `GET /recursos?tipo=&cidade=&gratuito=` · `GET /recursos/:id` | `PUT /recursos/:id` 🔒admin | `DELETE /recursos/:id` 🔒admin |

Outras: `POST /auth/login`, `GET /triagens/questionarios/:tipo`, `GET /recursos/filtros`, `GET /recursos/emergencia?cidade=`, `GET /health` (testa a conexão com o banco).

## Avisos importantes

- Os contatos dos CAPS/UBS cadastrados no `seed.sql` são genéricos (Secretaria Municipal de Saúde). O administrador deve conferir e atualizar telefones e endereços reais pela tela **Recursos**.
- Em caso de emergência real: **CVV 188** (24h) · **SAMU 192**.
