## Centro de Serviços (evolução do módulo Oficina)

Renomear o módulo de "Oficina" para **Centro de Serviços** e reconstruir a jornada completa: solicitação → aceite → check-in → checklist → serviços/peças → atualizações → conclusão, com reflexo no Passaporte do veículo. Tudo em mock local (zustand + persist), sem banco.

### Menu (5 itens)

`🏠 Hoje` · `📅 Agenda` · `🚗 Serviços` · `💰 Financeiro` · `👤 Perfil`

Rotas: `/oficina` (Hoje), `/oficina/agenda`, `/oficina/servicos`, `/oficina/servicos/$osId`, `/oficina/financeiro`, `/oficina/perfil`, `/oficina/solicitacoes/$id`, `/oficina/onboarding`. As telas atuais de Solicitações e Promoções são absorvidas: solicitações viram cards na Home + fila dentro de Serviços; promoções/campanhas viram bloco "Oportunidades" (Home) e aba no Financeiro.

### 1. Home "Hoje"

- Saudação + data + resumo: serviços agendados, aguardando aprovação, em manutenção, previsão de faturamento do dia.
- Card **Próximo atendimento** (veículo, hora, serviço, cliente) com botão "Iniciar atendimento".
- Card **Novas solicitações** (contador + "Responder").
- Card **Serviços em andamento** (lista com status por veículo).
- Card **Agenda do dia** (linha do tempo por horário).
- Card **Oportunidades**: veículos próximos da revisão + botão "Criar campanha".

### 2. Ordem de Serviço (núcleo)

Novo tipo `OrdemServico` com status: `solicitado → aceito → agendado → em_atendimento → aguardando_aprovacao → concluido` (+ `recusado`/`cancelado`).

Tela de detalhe `/oficina/servicos/$osId` em abas:
- **Resumo**: cliente, veículo, horário, status, ações de avanço de status.
- **Checklist de entrada**: fotos (simuladas), km, observações → salvar.
- **Serviços**: adicionar itens do catálogo (troca de óleo, pneu, freio, filtro, elétrica, outros) com valor e tempo.
- **Peças**: produto, quantidade, valor unitário, fornecedor → soma no orçamento.
- **Atualizações**: timeline de mensagens/fotos enviadas ao proprietário e motorista.
- **Finalizar**: fotos finais, valor total, garantia, observações → conclui.

Fila de serviços em `/oficina/servicos` com FiltroBar (status, tipo de serviço, período, busca por placa/cliente).

### 3. Efeitos da conclusão (ecossistema)

Ao concluir uma OS:
- Evento `manutencao` no Passaporte do veículo (store do proprietário) com valor e km.
- Custo somado no financeiro do veículo.
- Notificação para o proprietário ("Onix teve troca de óleo concluída") e mensagem de retirada para o motorista.
- Atualização do **Plano de Saúde do Veículo**.

### 4. Plano de Saúde do Veículo

Score 0–100 calculado por itens (óleo, freios, pneus, bateria, filtros) a partir de km e última manutenção, com selos OK / atenção / crítico. Exibido no detalhe da OS, no Passaporte do proprietário e no perfil do veículo do motorista.

### 5. Marketplace de oficinas

Aba dentro de Serviços: solicitações abertas da região com tipo, veículo, distância e valor estimado; a oficina aceita ou recusa. A vitrine da oficina (tipos de serviço, região, avaliação, disponibilidade, preço estimado) vem do cadastro.

### 6. Onboarding / Perfil

Wizard de 6 passos: dados → tipos de serviço (mecânica, óleo, pneus, funilaria, elétrica, ar, chaveiro, guincho, lava-rápido, vistoria, acessórios) → horários → fotos → endereço → contato. O Perfil reaproveita o mesmo formulário para edição, mais catálogo de serviços com preços.

### 7. Financeiro

Faturamento do dia/semana/mês, ticket médio, serviços concluídos, receita por tipo de serviço, custo de peças vs. mão de obra, campanhas ativas. Com FiltroBar (período, tipo de serviço).

### Técnico

- `src/lib/mock-oficina.ts`: tipos (`OrdemServico`, `ItemServico`, `Peca`, `AtualizacaoOS`, `CatalogoServico`, `SaudeVeiculo`, `CampanhaOficina`) + mocks com dados realistas.
- `src/lib/store-oficina.ts`: zustand com persist e ações (`aceitarSolicitacao`, `recusar`, `agendar`, `iniciarAtendimento`, `salvarChecklist`, `addServico`, `addPeca`, `enviarAtualizacao`, `concluirOS`, `criarCampanha`).
- Ponte com o proprietário: ao concluir, chamar as ações já existentes em `store-proprietario` (evento + custo + notificação).
- Reutiliza `FiltroBar`, `AppShell` e o design system atual — nenhuma mudança de tokens ou tipografia.
- `head()` próprio por rota nova.

### Fora do escopo

- Banco de dados, uploads reais, push notifications, pagamentos.
- Mudanças nas telas do motorista/passageiro/loja além do reflexo de status já previsto.
