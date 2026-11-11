# Regras de negócio do CuidaMente

Regras aplicadas na segunda entrega da AEP. Os códigos RF remetem aos [requisitos funcionais](requisitos-funcionais.md).

## Contas e permissões

| ID | Regra | Requisitos |
|---|---|---|
| RN01 | Existem os perfis Paciente e Administrador. O cadastro público cria somente pacientes. A base inicial inclui uma conta de administração criada pelo script de carga. A realização de triagens é exclusiva de pacientes. A gestão do catálogo e de contas de terceiros é exclusiva de administradores. | RF01, RF02, RF04 |
| RN02 | O nome deve ter entre 2 e 100 caracteres após remover espaços nas extremidades. O e-mail é obrigatório, deve ser válido, ter até 100 caracteres e ser único. O sistema remove espaços nas extremidades do e-mail e o normaliza para minúsculas. Senhas novas devem ter entre 6 e 72 caracteres. | RF02 |
| RN03 | O login exige e-mail cadastrado e senha correspondente. Cada conta pode alterar o próprio nome e e-mail, respeitando a unicidade do endereço, e precisa confirmar a senha atual para definir outra. | RF02 |
| RN04 | A exclusão da própria conta exige senha. Um administrador exclui a própria conta pelo fluxo “Minha conta”. A operação de gestão de usuários permite excluir outra conta. A aplicação bloqueia a exclusão do último administrador. Excluir uma conta remove suas triagens, as respostas associadas e seus lembretes. | RF02 |

## Triagem e histórico

| ID | Regra | Requisitos |
|---|---|---|
| RN05 | A triagem de depressão (`DEPRESSAO`) usa o PHQ-9, com nove perguntas. A triagem de ansiedade (`ANSIEDADE`) usa o GAD-7, com sete perguntas. Ambas consideram a frequência nas últimas duas semanas. | RF01 |
| RN06 | Uma triagem completa exige exatamente uma resposta para cada pergunta do instrumento escolhido. São inválidas perguntas de outro questionário, respostas duplicadas e valores fora dos inteiros de 0 a 3. | RF01, RF02 |
| RN07 | A pontuação é a soma das respostas. O máximo é 27 no PHQ-9 e 21 no GAD-7. O banco registra as respostas e o nível calculado. A aplicação deriva a pontuação das respostas armazenadas. | RF01, RF02, RF05 |
| RN08 | A classificação segue a tabela abaixo. No PHQ-9, uma resposta acima de zero à pergunta 9 tem precedência sobre a faixa de pontuação. | RF01, RF02, RF06 |
| RN09 | Cada triagem tem um titular, um instrumento e uma data de realização. Uma triagem nova usa a data local do servidor. A correção substitui o conjunto completo de respostas e recalcula o nível, preservando titular, instrumento e data. A exclusão de uma triagem remove todas as respostas associadas. | RF01, RF02, RF05 |
| RN10 | Somente o titular pode consultar, corrigir ou excluir uma triagem. O histórico usa a data de realização como ordem cronológica e o identificador como desempate. A tabela do painel mostra os registros mais recentes primeiro. | RF02, RF05 |
| RN15 | O painel usa a triagem mais recente de cada instrumento para o resumo. O gráfico aparece a partir de duas triagens no total, com séries por instrumento e valores calculados pela fórmula `arredondar(pontuação ÷ pontuação máxima × 100)`. | RF05 |
| RN18 | O resultado serve para auto-observação. A interface deve informar que a triagem não substitui avaliação profissional. | RF01 |

| Valor | Frequência |
|---|---|
| 0 | Nenhuma vez |
| 1 | Vários dias |
| 2 | Mais da metade dos dias |
| 3 | Quase todos os dias |

| Instrumento | Bem | Atenção | Crise |
|---|---|---|---|
| PHQ-9 | 0 a 4 pontos e resposta 0 na pergunta 9 | 5 a 14 pontos e resposta 0 na pergunta 9 | 15 a 27 pontos ou resposta 1, 2 ou 3 na pergunta 9 |
| GAD-7 | 0 a 4 pontos | 5 a 14 pontos | 15 a 21 pontos |

## Lembretes

| ID | Regra | Requisitos |
|---|---|---|
| RN11 | Um lembrete pertence à conta que o criou. A descrição tem de 2 a 255 caracteres após remover espaços nas extremidades. O horário deve ser válido no formato de 24 horas. A interface usa `HH:MM`. O cadastro pela interface cria lembretes ativos. A listagem é ordenada por horário e somente o titular pode consultar, alterar ou excluir o lembrete. | RF03 |
| RN12 | Um lembrete ativo dispara quando seu horário coincide com a hora e o minuto locais do navegador, com a aplicação aberta. A interface verifica os horários a cada 15 segundos e atualiza a lista a cada minuto ou logo após alterações na própria tela. Durante a mesma execução da interface, evita repetir um alerta para o mesmo lembrete, data e horário. A notificação do navegador depende de permissão concedida. | RF03 |

## Catálogo e apoio em crise

| ID | Regra | Requisitos |
|---|---|---|
| RN13 | Um recurso tem nome de 2 a 150 caracteres, contato e cidade de 2 a 100 caracteres cada, tipo válido e indicação de gratuidade. A API assume gratuidade se o campo for omitido. Tipos aceitos: `CVV`, `CAPS`, `UBS`, `EMERGENCIA`, `TELEATENDIMENTO`, `CLINICA_ESCOLA` e `OUTRO`. O catálogo depende dos dados mantidos pela administração. | RF04 |
| RN14 | Os filtros de tipo, cidade e gratuidade se acumulam. Ao selecionar uma cidade, o resultado inclui os serviços da cidade e os marcados como `Nacional` que atendam aos demais filtros. A lista exibe primeiro os recursos nacionais e ordena por cidade e nome. O seletor de cidades usa as localidades cadastradas, excluindo `Nacional`. | RF04 |
| RN16 | O modal abre quando uma triagem nova ou corrigida é salva com resultado Crise. O mesmo modal pode ser aberto manualmente pelo botão de ajuda. | RF06 |
| RN17 | O modal sempre exibe os contatos telefônicos de CVV e SAMU definidos na interface. A cidade é escolhida pelo usuário e lembrada no navegador. O modal consulta os registros do tipo `CAPS` da cidade selecionada e mostra a orientação alternativa quando a consulta não retorna contatos. A API de emergência retorna também os recursos nacionais dos tipos `CVV` e `EMERGENCIA`. | RF06 |

## Diferença entre a interface e a API

A interface reserva a tela de lembretes ao perfil Paciente. As rotas de lembretes da API exigem autenticação e limitam os registros à conta titular, mas não exigem a permissão específica de paciente. As consultas de questionários e de recursos de apoio são públicas na API, embora as telas correspondentes façam parte da área autenticada.

Consulte a [documentação de arquitetura](arquitetura.md), as [rotas da API](../src/backend/src/routes/index.ts) e o [esquema do banco](../database/schema.sql).
