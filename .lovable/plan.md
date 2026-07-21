# Módulo Proprietário — Expansão TCHI LÉVA

Front-end apenas. Sem conectar banco. Reutilizamos `AppShell`, design system atual e tipografia street. Mocks em `src/lib/mock-data.ts` (extensão) + `src/lib/mock-proprietario.ts` novo. Estado local com Zustand quando fizer sentido.

## Arquitetura de rotas (todas dentro de `/proprietario`)

Mantemos o layout atual (`proprietario.tsx` com tab bar). Ampliamos a tab bar para 5 abas + rotas internas:

```text
/proprietario                    → Dashboard (renomeia o atual "Frota")
/proprietario/frota              → Lista da frota (era o index atual)
/proprietario/frota/novo         → Cadastro veículo (já existe, ampliar campos)
/proprietario/frota/$carroId     → Passaporte Digital do Veículo (expande atual)
   ├─ aba: Visão geral
   ├─ aba: Linha do tempo
   ├─ aba: Documentos
   ├─ aba: Manutenção
   ├─ aba: Contratos
   └─ aba: Checklist
/proprietario/motoristas         → já existe, adicionar link para contrato
/proprietario/contratos          → NOVO: lista de contratos
/proprietario/contratos/$id      → NOVO: detalhe + pagamentos
/proprietario/contratos/novo     → NOVO: criar contrato
/proprietario/agenda             → NOVO: calendário de lembretes
/proprietario/notificacoes       → NOVO: central de notificações
/proprietario/financeiro         → já existe, enriquecer com custos/lucro
/proprietario/perfil             → já existe
```

Tab bar final (5 itens): **Início · Frota · Contratos · Agenda · Perfil**. Financeiro, Motoristas e Notificações viram cards/atalhos no Dashboard e ícone de sino no header.

## Telas — o que cada uma mostra

**Dashboard (`/proprietario`)**
- KPIs: total de veículos, alugados, disponíveis, em manutenção
- Cards: Receita do mês, Custos do mês, Lucro estimado (mocks)
- Bloco "Alertas": pagamentos pendentes, contratos vencendo, manutenções, documentos
- Atalhos: Cadastrar veículo, Novo contrato, Ver frota, Financeiro

**Frota (`/proprietario/frota`)**
- Grid de cards existente + filtro por status (Todos/Disponível/Alugado/Manutenção/Inativo)
- Badge de alerta (doc vencendo / manutenção) no card

**Cadastro veículo (`/proprietario/frota/novo`)**
- Ampliar campos: cor, chassi, renavam, combustível, km
- Uploads mock (Fotos: frente/traseira/laterais/interior; Docs: CRLV, seguro, licenciamento, IPVA, manual, NF) — só preview local, sem storage

**Passaporte Digital (`/proprietario/frota/$carroId`)**
Cabeçalho: foto + marca/modelo/placa + status + KPIs (Receita/Custos/Lucro/Km/Dias alugado/Dias parado). Abas internas:
- **Visão geral**: dados, motorista ativo, contrato ativo, próximos alertas
- **Linha do tempo**: eventos append-only (cadastro, locações, revisões, trocas de pneu/óleo, multas, acidentes). UI só permite "adicionar evento", nunca apagar
- **Documentos**: lista com data de vencimento + status (ok/vencendo/vencido)
- **Manutenção**: plano configurável (óleo, filtro, freios, pneus, alinhamento, balanceamento, correias, fluídos) com intervalo por km OU data + próxima previsão
- **Contratos**: histórico de contratos deste veículo
- **Checklist**: entrada e devolução (fotos mock, km, combustível, pneus, avarias, observações)

**Contratos (`/proprietario/contratos`)**
- Lista com motorista, veículo, valor, periodicidade, status (ativo/encerrado/suspenso)
- Filtro por status

**Detalhe do contrato (`/proprietario/contratos/$id`)**
- Dados do contrato + motorista vinculado (link p/ perfil)
- Tabela de pagamentos (valor, data, forma, status pago/pendente/atrasado)
- Ações mock: registrar pagamento, encerrar contrato, suspender

**Novo contrato (`/proprietario/contratos/novo`)**
- Seleciona motorista (da lista mock — reaproveita `motoristas`), seleciona veículo disponível, define valor/periodicidade/datas/caução/observações
- Ao criar (mock): veículo vira `alugado`, motorista vinculado

**Agenda (`/proprietario/agenda`)**
- Lista cronológica de lembretes (óleo, revisão, seguro, licenciamento, IPVA, fim de contrato)
- Chips de urgência: hoje / esta semana / este mês / futuro

**Notificações (`/proprietario/notificacoes`)**
- Feed unificado dos mesmos alertas, marcáveis como lidos (estado local)
- Ícone de sino no header do layout com contador

**Financeiro (`/proprietario/financeiro`)**
- Mantém gráfico atual, adiciona linha de custos e cálculo de lucro
- Breakdown por veículo (tabela)

**Motoristas (`/proprietario/motoristas`)**
- Mantém, adiciona badge "Contrato ativo" e link para o contrato

## Design / identidade

- Zero mudança no design system global — só aplicar tokens já existentes (grafite + amarelo/laranja/neon), tipografia street (`font-street`, `font-display`), `shadow-card`, `gradient-primary`
- Padrão visual das novas telas: mesmo do Motorista/Jornada (hero card com gradiente + cards com borda `border-border`)
- Ícones: `lucide-react` (Car, FileText, Wrench, CalendarClock, Bell, Receipt, ClipboardCheck, TimelineIcon → History)
- Avatar do proprietário no header segue o padrão do motorista (círculo com inicial)

## Dados mockados (novo arquivo `src/lib/mock-proprietario.ts`)

- `type Contrato`, `type Pagamento`, `type EventoVeiculo`, `type PlanoManutencao`, `type DocumentoVeiculo`, `type Checklist`, `type Notificacao`
- Sementes para 3–4 veículos existentes: linha do tempo com 5–8 eventos cada, 2 contratos ativos + 1 encerrado, pagamentos dos últimos 3 meses, 3 documentos por veículo com vencimentos variados, plano de manutenção default, notificações mistas

## Estado (Zustand — extensão de `useConect` ou novo `useProprietario`)

- `notificacoesLidas: string[]`
- `eventosAdicionados: Record<carroId, EventoVeiculo[]>` (append-only na UI)
- `contratosMock`, `pagamentosMock` como estado inicial derivado do mock, com ações `registrarPagamento`, `encerrarContrato`, `criarContrato` (mutando estado local)

## Integrações preparadas (só estrutura, sem lógica)

- Campo `origemKm: "manual" | "corrida"` no evento de km — placeholder para telemetria futura
- Botão "Enviar para oficina parceira" no card de manutenção → navega para `/proprietario/frota/$carroId` com toast "Em breve"
- Tipos exportados prontos para migração futura ao banco

## Fora do escopo desta rodada

- Persistência real / Supabase
- IA de recomendações
- Telemetria real de corridas
- Upload de arquivo real (fica preview local)

## O que NÃO muda

- Nenhuma rota existente é removida
- Fluxos de Motorista, Passageiro, Oficina, Loja, Admin ficam idênticos
- Design system global e assets de marca permanecem

## Ordem de implementação (após aprovação)

1. Tipos + mock-proprietario.ts + store
2. Dashboard novo (reutilizando o atual como base) + Frota separada
3. Passaporte Digital com abas
4. Contratos (lista, detalhe, novo)
5. Agenda + Notificações + sino no header
6. Financeiro enriquecido
7. Ampliação do cadastro de veículo
