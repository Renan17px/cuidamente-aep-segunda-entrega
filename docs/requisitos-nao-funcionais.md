# Requisitos não funcionais do CuidaMente

Especificação da segunda entrega da AEP baseada nas restrições documentadas e nos mecanismos identificados no código. Os critérios indicam como verificar cada requisito. O projeto não define metas numéricas de latência, volume de usuários simultâneos ou disponibilidade, nem uma certificação de acessibilidade.

| ID | Área | Requisito | Critério de verificação |
|---|---|---|---|
| RNF01 | Segurança de credenciais | Armazenar senhas como hashes bcrypt e omitir senha e hash das respostas da API. | A geração de hash usa custo 10. O perfil retornado no cadastro, no login e nas consultas de usuários não contém credenciais armazenadas. |
| RNF02 | Sessão autenticada | Proteger rotas privadas com JWT assinado, enviado como `Authorization: Bearer`, com expiração configurável. | A API verifica a assinatura e a validade do token e carrega o usuário atual. Token ausente, inválido ou expirado, ou associado a uma conta excluída, resulta em HTTP 401. O prazo padrão é 8 horas. |
| RNF03 | Controle de acesso e privacidade | Aplicar no servidor as permissões administrativas e isolar os dados pessoais de triagens e lembretes por conta. | A tentativa de acessar um registro pessoal de outra conta recebe HTTP 403. A API rejeita operações administrativas sem a permissão exigida. |
| RNF04 | Segurança das consultas | Parametrizar os valores recebidos do cliente nas consultas SQL. | Filtros, identificadores e campos fornecidos pelo cliente são passados como parâmetros ao driver. |
| RNF05 | Integridade relacional | Garantir unicidade do e-mail e de cada pergunta por triagem e preservar os vínculos entre usuários, triagens, respostas e lembretes. | O esquema MySQL aplica restrições de unicidade, chaves estrangeiras e exclusões em cascata conforme RN04 e RN09. |
| RNF06 | Consistência das gravações | Gravar a triagem e suas respostas de forma atômica tanto na criação quanto na correção. | Uma falha durante a gravação reverte a transação inteira, evitando triagem incompleta ou respostas parcialmente substituídas. |
| RNF07 | Tratamento de erros | Retornar erros HTTP em JSON, com status coerente, e apresentar mensagens compreensíveis nas operações principais da interface. | Verificar, entre outros casos, 400 para entrada inválida, 401 para autenticação, 403 para acesso negado, 404 para recurso ausente e 409 para e-mail duplicado. A interface também informa quando a API não responde. |
| RNF08 | Limite de entrada | Limitar o tamanho de corpos JSON aceitos pela API. | O servidor Express configura o analisador JSON com limite de `100kb`. |
| RNF09 | Diagnóstico operacional | Permitir diagnóstico da conexão com o banco na inicialização e sob demanda. | O servidor registra o resultado da tentativa inicial e sobe mesmo se a conexão falhar. `/api/health` só retorna estado saudável após obter uma conexão e executar o ping no MySQL. |
| RNF10 | Compatibilidade técnica | Usar TypeScript com React e Vite na interface, Node.js e Express na API e MySQL 8 para persistência. | O projeto oferece execução com Node.js 18+ conforme o README e suporta MySQL instalado diretamente ou via Docker. |
| RNF11 | Configuração e implantação | Configurar conexão com o banco, porta da API e parâmetros do JWT por variáveis de ambiente. Oferecer modos de desenvolvimento e produção. | Em desenvolvimento, Vite e API rodam separados. Quando o front-end está compilado, o servidor Express pode servi-lo na mesma porta da API. A inicialização do banco dispõe de scripts de esquema e dados iniciais. |
| RNF12 | Datas, horários e caracteres | Preservar datas e horários SQL como texto no driver e armazenar conteúdo com suporte a Unicode. | O pool MySQL usa `dateStrings` e `utf8mb4`. A interface apresenta datas no padrão brasileiro e horários de lembrete em `HH:MM`. |
| RNF13 | Responsividade e idioma | Apresentar a interface em português e adaptar a navegação e o conteúdo a telas estreitas. | Em largura de até 760 px, verificar o menu recolhível e o acesso aos controles e às tabelas. |
| RNF14 | Acessibilidade da interface | Identificar campos e controles, anunciar alertas dinâmicos e oferecer fechamento por teclado do modal de crise. | Conferir rótulos de formulários e botões, regiões `aria-live`, semântica de diálogo, fechamento com Escape e respeito à preferência de movimento reduzido nas animações do chat. |
| RNF15 | Manutenibilidade e POO | Organizar a API em rotas, controllers, services, modelos, repositórios e middlewares. Demonstrar abstração, interfaces, herança, polimorfismo, encapsulamento e composição conforme a segunda entrega. | Verificar as classes abstratas `Usuario` e `Triagem`, as interfaces `Avaliavel` e `Repositorio<T>`, a composição entre triagem e respostas e a compilação do back-end com `noImplicitOverride`. |

## Condições observadas na implementação

- Os alertas de autocuidado dependem da aplicação aberta e do relógio local do navegador. A notificação do sistema depende do suporte e da permissão do navegador. Consulte RN12.
- O token da sessão e a cidade escolhida no modal são armazenados no navegador. O encerramento da sessão remove o token local.
- A configuração inclui valores padrão de desenvolvimento para o JWT e o servidor registra um aviso quando o segredo padrão é usado.
- A gestão do catálogo permite atualização manual dos contatos. A disponibilidade e a atualidade dos serviços cadastrados dependem da manutenção do catálogo.

Referências do projeto disponíveis na [arquitetura](arquitetura.md), no [README](../README.md), no [esquema do banco](../database/schema.sql), no [servidor](../src/backend/src/server.ts), na [configuração do banco](../src/backend/src/config/database.ts) e nas [regras de negócio](regras-de-negocio.md).
