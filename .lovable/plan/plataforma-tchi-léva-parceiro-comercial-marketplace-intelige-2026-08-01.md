# Plataforma TCHI LÉVA — Parceiro comercial, Marketplace Inteligente e Monetização

Evolução do módulo `Loja` (hoje só Dashboard, Campanhas e Perfil, com dados fixos) para um **Parceiro Comercial** completo — autopeças, lojas e prestadores — mais a **Central de Oportunidades** e a camada de **receita da plataforma**. Tudo em mock local (zustand + persist), sem banco.

## 1. Novo menu do Parceiro (5 abas)

`🏠 Home` · `🏪 Meu Negócio` · `📦 Catálogo` · `📥 Estoque` · `🧾 Pedidos`

Rotas: `/loja` (Home), `/loja/negocio`, `/loja/catalogo`, `/loja/catalogo/$itemId`, `/loja/catalogo/novo`, `/loja/estoque`, `/loja/pedidos`, `/loja/pedidos/$pedidoId`, `/loja/oportunidades`, `/loja/plano`. As campanhas atuais passam a viver dentro de Oportunidades; o Perfil vira "Meu Negócio".

## 2. Home — "Como está meu negócio hoje?"

Saudação + resumo do dia: vendido hoje, pedidos, clientes novos, produtos acabando, oportunidades detectadas. Abaixo: card de **próximos pedidos**, card de **estoque baixo**, card de **Central de Oportunidades** (contador + CTA) e faixa de **plano** (Gratuito x Premium) com o que está bloqueado.

## 3. Meu Negócio

Cadastro institucional: nome, categorias, descrição, endereço, região atendida, horários por dia, fotos, equipe, formas de pagamento, entrega/retirada. Mesmo formulário serve para onboarding e edição.

## 4. Catálogo

Lista unificada com filtros (`FiltroBar`: busca, tipo produto/serviço, categoria, disponibilidade) e um formulário que muda conforme o tipo:

- **Produto**: nome, marca, preço, quantidade, fotos, compatibilidade de veículos, categorias.
- **Serviço**: nome, preço, tempo médio, garantia, agendável.

Detalhe do item mostra também: comissão da plataforma estimada e visualizações/leads recebidos.

## 5. Estoque

Fluxo simples: entrada → saída → estoque baixo → reposição → histórico. Lista com alerta visual de mínimo, botões de entrada/saída rápidas e timeline de movimentações. Sem virar ERP.

## 6. Pedidos

Fila única de pedidos, orçamentos, agendamentos, compras e solicitações. Status: `novo → aceito → em_preparo → pronto → entregue` (+ `recusado`). Detalhe com itens, cliente, valor, **comissão TCHI LÉVA destacada**, valor líquido do parceiro e ações de avanço de status. Filtros por tipo, status e período.

## 7. Central de Oportunidades (o diferencial)

Rota própria `/loja/oportunidades`, alimentada pelos dados que o ecossistema já tem em mock (frota do proprietário, km, saúde do veículo do Centro de Serviços, corridas do motorista):

- Demanda prevista: "23 veículos da região trocam óleo nos próximos 15 dias", "12 com pneus perto do limite".
- Frotas ativas e oficinas comprando recorrentemente.
- Solicitações de orçamento abertas.
- Sugestões de campanha prontas ("campanha de almoço 11h30–14h", "15% OFF troca de óleo") com botão **Criar campanha**, que gera a campanha e passa a aparecer para motoristas/passageiros.

Cada oportunidade traz motivo, alcance estimado, receita potencial e ação de um clique.

## 8. Marketplace Inteligente (motor)

Regra em mock que cruza km/última manutenção de cada veículo com o catálogo dos parceiros e produz:
- para o **parceiro**: as oportunidades acima;
- para **motorista/proprietário**: sugestões contextuais ("seu Onix está a 200 km da troca — 3 lojas com o filtro compatível"), com preço, distância e link para pedido/agendamento.

## 9. Monetização visível

Camada de receita aplicada às transações mock: comissão de 8% em produtos, 10% em serviços, planos Gratuito/Premium, leads pagos e publicidade contextual (sem banner — sempre baseada em necessidade).

- No Parceiro: detalhe de pedido mostra bruto, comissão e líquido; tela `/loja/plano` compara Gratuito x Premium (destaque nas buscas, relatórios, IA de campanhas, catálogo/estoque completos) com upgrade simulado.
- No Admin (`/admin/financeiro`): novo bloco de receita da plataforma por fonte — comissão de produtos, comissão de serviços, assinaturas, leads, publicidade — com GMV, take rate e evolução mensal.

## Técnico

- `src/lib/mock-parceiro.ts`: tipos (`Parceiro`, `ItemCatalogo`, `Produto`, `Servico`, `MovimentoEstoque`, `Pedido`, `Oportunidade`, `Campanha`, `Plano`) + mocks realistas do Grajaú.
- `src/lib/store-parceiro.ts`: zustand com persist — `salvarNegocio`, `addItem`, `editarItem`, `entradaEstoque`, `saidaEstoque`, `avancarPedido`, `recusarPedido`, `criarCampanha`, `assinarPremium`.
- `src/lib/marketplace-inteligente.ts`: funções puras que leem `store-proprietario` e `store-oficina` para gerar oportunidades e sugestões — sem duplicar dados.
- `src/lib/monetizacao.ts`: taxas, cálculo de comissão e agregados para o Admin.
- Reutiliza `AppShell`, `FiltroBar`, `SaudeVeiculoCard` e os tokens atuais — nenhuma mudança de design system.
- `head()` próprio em cada rota nova.

## Fora do escopo

- Banco de dados, pagamentos reais, uploads reais, push, IA de verdade (as sugestões são regras determinísticas), ERP e serviços financeiros (item 7 da sua lista fica como visão futura).
