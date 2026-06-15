# Plano — Conect (MVP front-end, sem banco)

App mobile-first, claro e amigável, 100% navegável com dados mockados. Sem autenticação real, sem Lovable Cloud nesta fase. Tudo roda no front-end e pode ser migrado para Supabase depois sem reescrever telas.

## Identidade visual

- **Nome:** Conect
- **Tom:** claro, amigável, marketplace (referência iFood/Uber light)
- **Paleta (light):** branco/areia como base, accent quente (laranja vibrante) + verde sucesso para ganhos/cashback
- **Tipografia:** par display + body distinto (não Inter/Poppins) — proposta: *Sora* (display) + *Manrope* (body)
- **Componentes:** shadcn customizado, cards arredondados, sombras suaves, bottom tabs estilo app nativo
- **Mobile-first:** layout pensado para 390px, escala bem até desktop

## Arquitetura de rotas (TanStack Router)

```text
/                       → Splash + escolha de perfil (5 cards)
/auth                   → Login/cadastro fake (qualquer dado entra)

/motorista              → layout com bottom tabs
  /motorista/           → Home (ganhos, cashback, atalhos)
  /motorista/beneficios → Mapa/lista de oficinas parceiras
  /motorista/beneficios/$parceiroId → detalhe + pedir orçamento
  /motorista/alugueis   → carros disponíveis
  /motorista/alugueis/$carroId → detalhe + enviar proposta
  /motorista/perfil     → dados, documentos, sair

/proprietario           → layout com bottom tabs
  /proprietario/        → Frota (carros cadastrados)
  /proprietario/frota/novo → cadastrar carro
  /proprietario/frota/$carroId → detalhe, status, propostas
  /proprietario/motoristas → motoristas alugando
  /proprietario/financeiro → recebimentos
  /proprietario/perfil

/oficina                → layout com bottom tabs
  /oficina/             → Solicitações de orçamento
  /oficina/agenda       → agendamentos
  /oficina/promocoes    → criar/editar promoções e cupons
  /oficina/perfil

/passageiro             → layout com bottom tabs (versão preview)
  /passageiro/          → pedir corrida (mock)
  /passageiro/cashback  → carteira
  /passageiro/parceiros → lojas locais
  /passageiro/perfil

/loja                   → layout com bottom tabs (versão preview)
  /loja/                → dashboard (clientes via app, cashback usado)
  /loja/campanhas       → cupons e promoções
  /loja/perfil
```

Todas as rotas com `head()` próprio (title/description/og) — cada perfil é uma landing indexável.

## Dados mockados (sem banco)

Arquivo `src/lib/mock-data.ts` com listas TypeScript de:
- motoristas, proprietários, oficinas, passageiros, lojas
- carros para aluguel, serviços/promoções, propostas, solicitações de orçamento, transações de cashback

Estado leve de UI com **Zustand** (perfil ativo, "logado como X", carrinho de propostas) persistindo em `localStorage` para o protótipo parecer vivo entre reloads.

## Telas do MVP (resumo do que cada tela mostra)

### Motorista (foco do produto)
- **Home:** card de ganhos do dia, cashback acumulado, aluguel ativo, atalhos para benefícios
- **Benefícios:** lista filtrável (borracharia, mecânica, lava-rápido, óleo, funilaria, elétrica, guincho); cada card mostra desconto e distância
- **Detalhe parceiro:** fotos, serviços, horários, botão *Pedir orçamento* (abre modal) e *Agendar*
- **Aluguéis:** grid de carros com diária/mensal/caução; filtros por cidade e faixa de preço
- **Detalhe carro:** fotos, specs, proprietário, botão *Enviar proposta*
- **Perfil:** dados cadastrais, CNH, documento do veículo, app que trabalha

### Proprietário
- **Frota:** cards de cada carro (alugado/disponível/manutenção)
- **Novo carro:** form completo (modelo, ano, placa, diária, mensalidade, caução, km, seguro, fotos)
- **Detalhe carro:** propostas recebidas, histórico de aluguel, manutenção
- **Motoristas:** lista com avaliação, tempo de aluguel, status
- **Financeiro:** recebimentos por mês, gráfico simples (Recharts)

### Oficina
- **Solicitações:** inbox de orçamentos com status (novo/respondido/agendado)
- **Agenda:** calendário semanal de serviços confirmados
- **Promoções:** criar cupom (% de desconto, validade, serviço aplicável)

### Passageiro (preview, simplificado)
- pedir corrida (form mock com origem/destino), carteira de cashback, lojas parceiras próximas

### Loja (preview, simplificado)
- dashboard de clientes vindos do app, cupons ativos, cashback consumido

## Componentes compartilhados

- `AppShell` com bottom tab bar (mobile) e sidebar opcional (≥md)
- `ProfileSwitcher` no topo — permite trocar de perfil rapidamente para testar
- `EmptyState`, `StatCard`, `ListItem`, `BottomSheet` (drawer mobile), `FormCard`
- Modais de "Pedir orçamento" e "Enviar proposta" — apenas atualizam o mock local

## O que NÃO entra agora (decisão do brief)

Pagamentos, carteira real, chat em tempo real, algoritmo de corridas, rastreamento, antifraude, IA, notificações push. Tudo isso fica para fases seguintes.

## Detalhes técnicos

- **Stack:** TanStack Start + React 19 + Tailwind v4 + shadcn (já no template)
- **Sem Lovable Cloud nesta fase** — `mock-data.ts` + Zustand com persist
- **Gráficos:** Recharts (já disponível via shadcn/ui)
- **Ícones:** lucide-react
- **Mapas:** placeholder visual (imagem + pins absolutos) — não integrar Mapbox ainda
- **Imagens:** geradas (hero da splash, mockups de carros/oficinas) e armazenadas em `src/assets/`
- **Mobile-first:** viewport do preview definido para mobile; layouts usam grid responsivo (`grid-cols-[minmax(0,1fr)_auto]` em headers, `min-w-0`/`shrink-0`/`truncate`)

## Ordem de execução

1. Design system no `src/styles.css` (tokens Conect: laranja accent, verde sucesso, areia, sombras, gradientes)
2. `AppShell` + bottom tabs + `ProfileSwitcher`
3. Splash `/` com 5 cards de perfil + `/auth` fake
4. Fluxo **Motorista** completo (prioridade — é o coração do app)
5. Fluxo **Proprietário**
6. Fluxo **Oficina**
7. Fluxos **Passageiro** e **Loja** (versão preview)
8. Polimento, microinterações (framer-motion), revisão mobile
9. `sitemap.xml` + `robots.txt` listando todas as rotas

Depois deste MVP, próximo passo natural é ligar o Lovable Cloud e substituir `mock-data.ts` por queries reais — sem tocar nas telas.