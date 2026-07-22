## Refinos no módulo Proprietário

Ao clicar em um veículo da frota, o Passaporte já existe com 6 abas — vou reforçá-lo para virar o "histórico completo do carro" que você descreveu, e adicionar registros manuais + filtros avançados em todas as telas do perfil.

### 1. Passaporte do veículo (`/proprietario/frota/:carroId`)

Aba **Visão geral** ganha um resumo do histórico:
- Total gasto em manutenção, nº de manutenções, nº de contratos, km rodado desde o cadastro, última manutenção, próxima manutenção prevista.
- Motoristas que já passaram pelo carro (lista compacta).

Aba **Linha do tempo** vira o histórico principal, com:
- Filtros por tipo (manutenção, KM, contrato, pagamento, observação, custo avulso) e por período (30d / 90d / ano / tudo).
- Botão único **"+ Adicionar"** com menu: *Manutenção*, *Custo avulso*, *Observação*, *Lembrete*, *Atualizar KM*.
  - **Manutenção**: reaproveita o formulário atual (item, km, data, valor, obs) e cai na timeline + plano de manutenção.
  - **Custo avulso** (novo): descrição, categoria (lavagem, multa, estacionamento, IPVA, outro), valor, data → entra na timeline como evento `custo` e soma no financeiro do carro.
  - **Observação** (novo): texto livre + data → evento `observacao` na timeline.
  - **Lembrete** (novo): título, data-alvo, recorrência (nenhuma/mensal/anual) → aparece na Agenda e vira notificação quando chega o dia.

Aba **Manutenção**: já tem "Registrar manutenção"; adiciono filtro por status (em dia / próxima / vencida) e ordenação por próximo km.

### 2. Filtros avançados nas telas do Proprietário

Padrão: barra recolhível "Filtros" no topo com chips + campos, mantendo o visual atual.

- **Frota** (`/proprietario/frota`): além do status já existente, busca por texto (placa/modelo), filtro por *publicado / não publicado*, *com alerta de documento*, ordenação (mais novo / km / receita).
- **Contratos**: status (ativo/suspenso/encerrado), motorista (texto), veículo (select), período de início, faixa de valor.
- **Agenda**: tipo (documento / manutenção / contrato / lembrete), urgência (vencido / hoje / semana / mês / futuro), veículo.
- **Notificações**: tipo, urgência, lidas / não lidas, veículo.
- **Financeiro**: período (mês / trimestre / ano / custom), veículo, categoria de custo (manutenção / avulso / documento).
- **Marketplace**: cidade, faixa de diária, periodicidade.
- **Motoristas**: status (ativo / candidato / inativo), nota mínima.

### 3. Store e mock

Em `mock-proprietario.ts` e `store-proprietario.ts`:
- Novos tipos de evento: `custo` e `observacao` (o tipo `EventoVeiculo` já é aberto, só ampliar o enum + ícone).
- Novo tipo `Lembrete { id, carroId, titulo, dataAlvo, recorrencia, feito }` com ações `criarLembrete`, `concluirLembrete`, `removerLembrete`.
- `financeiroPorVeiculo` passa a considerar eventos `custo` e `manutencao` do store para os totais.
- Persistência via zustand `persist` (já configurada).

### 4. Componente reutilizável

Um `<FiltroBar>` simples (chips + inputs em `<details>` para não poluir mobile) usado em todas as telas listadas, para manter consistência visual.

### Fora do escopo

- Backend / uploads reais.
- Envio real de lembretes (só notificação in-app quando a data bater, disparado na entrada da rota).
- Mudanças em outros perfis ou no design system.
