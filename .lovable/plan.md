# Refino do Módulo Proprietário — cobrir as 13 jornadas do brief

O módulo Proprietário já tem a maior parte da estrutura (Dashboard, Frota, Passaporte com 6 abas, Contratos, Agenda, Notificações, Financeiro, Perfil). O brief pede refinos + algumas jornadas novas. Tudo em mock, sem tocar em outros perfis nem no design system.

## O que já está OK (só polir visual)

- J1 Dashboard — KPIs, alertas, atalhos, lucro do mês
- J6 Contrato — detalhe, suspender, encerrar
- J7 Passaporte — 6 abas
- J8 Pagamentos — lista com status
- J11 Manutenção — plano com próximos
- J13 Financeiro — receita × custos, breakdown

## O que falta implementar

### 1. Cadastro do veículo em etapas (J2)
`proprietario.frota.novo.tsx` vira wizard de 4 passos com stepper: Básico → Documentação → Fotos → Revisão. Uploads mock (só preview local). No submit, cria veículo no store e navega para o Passaporte com toast "Passaporte digital criado".

### 2. Publicar veículo para locação (J3)
No Passaporte, aba Visão Geral, novo bloco "Anúncio no Marketplace" com botão **Disponibilizar para locação**. Abre sheet/modal com: valor (diária/mensal), periodicidade, caução, requisitos (habilitação mínima, idade), observações. Ao publicar, seta `publicado: true` + `anuncio` no store e mostra badge "Publicado" no card da frota.

### 3. Marketplace simulado + solicitação de locação (J4)
Nova rota `proprietario.marketplace.tsx` (atalho no Dashboard, não vira aba) mostrando cards de veículos publicados de "outros proprietários" (mock). Botão "Simular solicitação recebida" gera uma `SolicitacaoLocacao` no store e uma notificação no sino. Serve para o proprietário testar a Jornada 5.

### 4. Avaliar motorista + Aceitar/Recusar (J5)
Nova rota `proprietario.solicitacoes.$id.tsx`. Mostra perfil do motorista mock (nome, nota, tempo na plataforma, corridas, pontualidade, histórico, observações). Ações **Aceitar** (cria contrato ativo, veículo vira `alugado`, gera pagamentos futuros mock) e **Recusar** (fecha solicitação, notifica). Entrada pelo card de notificação "Nova solicitação".

### 5. Registrar pagamento com forma/data (J8 refino)
Na tela de contrato, o botão "Registrar pagamento" abre modal com valor, data, forma (Pix/Dinheiro/Cartão/Transf.). Toggle "Ativar lembretes automáticos" no cabeçalho do contrato (só UI + persistência local).

### 6. Configurar lembretes ao locatário (J9)
Aba nova no contrato: **Lembretes**. Checkboxes: vencimento de aluguel (3/1/0 dias antes), pedido de foto do painel (mensal), lembrete de documentação. Salva no store, sem envio real.

### 7. Atualização de KM via foto do painel (J10)
No Passaporte, aba Visão Geral, card "Quilometragem". Botão **Solicitar foto do painel** (gera notificação mock "Foto recebida" após 2s). Ao clicar na notificação, abre modal com foto mock + campo KM + botões Conferir/Confirmar. Ao confirmar: atualiza `km` do veículo, recalcula `proximoKm` de cada item de manutenção, cria evento na linha do tempo com `origemKm: "manual"`.

### 8. Registrar manutenção (J12)
Na aba Manutenção do Passaporte, botão **Registrar manutenção**. Modal com item, valor, data, KM, observações. Ao salvar: cria evento na timeline (`troca-oleo`/`revisao`/etc.), atualiza `ultimoKm`/`ultimaData`/`proximoKm` do item, soma no custo do veículo (mock financeiro).

### 9. Ajustes finos de UI
- Dashboard: reordenar blocos na ordem "Frota → Financeiro → Alertas → Ecossistema (atalhos p/ Marketplace, Motoristas, Financeiro)"
- Frota: badge "Publicado" e "Alugado" nos cards
- Financeiro: tornar breakdown por veículo clicável (abre Passaporte)

## Extensões em `mock-proprietario.ts` e `store-proprietario.ts`

Novos tipos: `AnuncioLocacao`, `SolicitacaoLocacao`, `MotoristaCandidato`, `ConfigLembretes`.
Novas ações no store: `publicarVeiculo`, `despublicar`, `criarSolicitacaoMock`, `aceitarSolicitacao`, `recusarSolicitacao`, `atualizarKm`, `registrarManutencao`, `salvarLembretes`, `registrarPagamentoDetalhado`.
Seeds: 3 veículos publicados de "outros proprietários" p/ Marketplace, 3 motoristas candidatos com histórico rico.

## Fora do escopo

- Backend / Supabase / uploads reais
- Envio real de notificações push/SMS
- Busca e filtros complexos no Marketplace (só listagem)
- Mudanças em outros perfis (Motorista, Passageiro, Oficina, Loja, Admin)
- Alterações no design system global

## Ordem de implementação

1. Extensão de tipos + store + seeds
2. Wizard de cadastro (J2)
3. Publicar veículo + Marketplace + Solicitação/Avaliação (J3-J5)
4. Atualização de KM + Registrar manutenção (J10, J12)
5. Lembretes + pagamento detalhado (J8, J9)
6. Polimentos de UI no Dashboard/Frota/Financeiro
