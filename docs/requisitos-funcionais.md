# Requisitos funcionais do CuidaMente

Especificação da segunda entrega da AEP. Os identificadores RF01 a RF06 correspondem aos do [README](../README.md). Os subitens detalham o comportamento de cada funcionalidade. A API usa o prefixo `/api`.

## RF01 — Triagem guiada

| ID | O sistema deve | Referência |
|---|---|---|
| RF01.1 | Disponibilizar na API a lista de questionários e a consulta individual por tipo, com instrumento, enunciado, perguntas e opções de resposta. | RN05, RN06 |
| RF01.2 | Permitir ao paciente escolher entre depressão (PHQ-9) e ansiedade (GAD-7) e responder em formato de chat, uma pergunta por vez, com indicação de progresso e opção de voltar para revisar respostas. | RN01, RN05, RN06 |
| RF01.3 | Validar o questionário completo no envio, calcular a pontuação e o nível e registrar a triagem com as respostas na conta do paciente. | RN06 a RN09 |
| RF01.4 | Exibir o instrumento, a pontuação obtida, o máximo possível e o nível Bem, Atenção ou Crise após o envio. Informar que o resultado serve para auto-observação e orientar o paciente a consultar o histórico ou os canais de apoio. | RN07, RN08, RN18 |
| RF01.5 | Ao concluir um questionário, permitir recomeçar a triagem ou iniciar o questionário do outro instrumento. | RN05 |

## RF02 — Cadastro, sessão, conta e histórico pessoal

| ID | O sistema deve | Referência |
|---|---|---|
| RF02.1 | Cadastrar pacientes com nome, e-mail e senha e iniciar uma sessão após o cadastro bem-sucedido. | RN01, RN02 |
| RF02.2 | Autenticar pacientes e administradores com e-mail e senha, restaurar a sessão válida ao reabrir a interface e permitir sair. | RN02, RN03 |
| RF02.3 | Permitir ao usuário consultar o próprio perfil, atualizar nome e e-mail e trocar a senha mediante confirmação da senha atual. | RN02, RN03 |
| RF02.4 | Permitir ao usuário excluir a própria conta mediante senha e confirmação na interface, com remoção dos dados dependentes. | RN04 |
| RF02.5 | Permitir ao administrador listar usuários e excluir outras contas conforme as restrições do perfil. | RN01, RN04 |
| RF02.6 | Permitir ao paciente consultar as próprias triagens e seus detalhes, incluindo cada resposta. A API deve aceitar filtro por tipo na listagem. | RN09, RN10 |
| RF02.7 | Permitir ao paciente corrigir as respostas de uma triagem existente, recalcular o resultado e excluir triagens do próprio histórico após confirmação na interface. | RN06 a RN10 |

## RF03 — Lembretes de autocuidado

| ID | O sistema deve | Referência |
|---|---|---|
| RF03.1 | Permitir ao paciente criar, listar, editar, ativar, desativar e excluir lembretes pessoais. A API também deve permitir consultar um lembrete por identificador. | RN11 |
| RF03.2 | Permitir descrição livre e horário personalizado, com sugestões de atividades como hidratação, meditação, pausa e atividade física. | RN11 |
| RF03.3 | Exibir um alerta dispensável na plataforma no horário de um lembrete ativo. Permitir que o paciente solicite permissão para receber também notificações do navegador, quando o recurso estiver disponível. | RN12 |

## RF04 — Catálogo de canais de apoio

| ID | O sistema deve | Referência |
|---|---|---|
| RF04.1 | Exibir nome, tipo, contato, localização e indicação de gratuidade dos serviços de apoio. Disponibilizar listagem, detalhes por identificador e opções de filtro na API pública. | RN13, RN14 |
| RF04.2 | Filtrar o catálogo por tipo e cidade e oferecer a opção “Somente gratuitos” na interface. A API deve aceitar também a seleção explícita de serviços não gratuitos. | RN14 |
| RF04.3 | Permitir ao administrador cadastrar, editar e excluir os recursos do catálogo, incluindo serviços locais e nacionais. | RN01, RN13 |

## RF05 — Painel de evolução

| ID | O sistema deve | Referência |
|---|---|---|
| RF05.1 | Exibir a última triagem de cada instrumento, com nível, data e pontuação, e oferecer acesso à triagem correspondente quando não houver registro. | RN10, RN15 |
| RF05.2 | Exibir gráfico de linha com uma série por instrumento e a evolução cronológica em percentual da pontuação máxima. | RN15 |
| RF05.3 | Exibir a quantidade total de triagens e o histórico com data, instrumento, pontuação e nível, com acesso ao detalhe, à correção e à exclusão. | RN09, RN10, RN15 |

## RF06 — Apoio em situação de crise

| ID | O sistema deve | Referência |
|---|---|---|
| RF06.1 | Abrir automaticamente o modal de apoio após salvar uma triagem nova ou corrigida cujo resultado seja Crise. | RN08, RN16 |
| RF06.2 | Oferecer o botão “Preciso de ajuda agora” na área autenticada para abrir o mesmo modal a qualquer momento. | RN16 |
| RF06.3 | Exibir links telefônicos para os contatos nacionais configurados na interface e permitir selecionar uma cidade para consultar os CAPS cadastrados. Quando a cidade selecionada não retornar CAPS, exibir a orientação alternativa do modal. | RN17 |
| RF06.4 | Disponibilizar na API uma consulta pública aos recursos nacionais de apoio e emergência e aos CAPS da cidade informada. | RN17 |

## RF07 — Verificação operacional

| ID | O sistema deve | Referência |
|---|---|---|
| RF07.1 | Disponibilizar `GET /api/health` para verificar a disponibilidade da API e a conexão com o MySQL. | RNF09 |

Consulte as [regras de negócio](regras-de-negocio.md), os [requisitos não funcionais](requisitos-nao-funcionais.md) e o [mapa de rotas da API](../src/backend/src/routes/index.ts).
