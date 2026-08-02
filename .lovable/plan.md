# Jornada do Motorista — reorganização (sem quebrar nada)

Nada de regra de negócio muda: níveis, taxas fixas (R$4,00 → R$3,00), avatares, regras de manutenção mensal, check-in, missões, simulador e histórico continuam exatamente como estão em `src/lib/niveis.ts` e `src/lib/store.ts`. O que muda é a organização das telas, a hierarquia da Home, os estados de operação e a costura com os outros módulos (proprietário, centro de serviços, parceiros, marketplace).

## Navegação (5 abas, sem menu novo)

Hoje: Início · Corridas · Jornada · Oficinas · Perfil
Depois: **Início · Rodar · Clube · Operação · Perfil**

- **Rodar** absorve Corridas + check-in + os estados online/em corrida.
- **Clube** absorve Jornada + Oficinas/Benefícios em abas internas (Meu nível, Benefícios, Parceiros, Missões, Ranking, Conquistas). Nenhuma tela é apagada: as rotas atuais `/motorista/jornada` e `/motorista/beneficios` continuam existindo e passam a ser as abas do Clube.
- **Operação** é o único módulo realmente novo (financeiro do motorista + veículo).
- Orçamentos e Aluguéis continuam acessíveis por atalhos dentro de Operação e Clube.

## Home reorganizada (`/motorista`)

Ordem dos blocos, reutilizando componentes já existentes:

1. **Cabeçalho** — avatar do nível, nome, badge do nível, toggle Online/Offline e barra fina de progresso para o próximo nível (evolução do `AppShell` header + `NivelBadge`).
2. **Meu Nível** (card principal) — `NivelHero` já traz avatar, viagens faltantes, taxa e progresso; ganha a economia acumulada, 2–3 benefícios desbloqueados e o botão **Ver benefícios** → Clube.
3. **Resumo do Dia** — ganhos, corridas, meta do dia e tempo online (reaproveita `ganhosDoDia`).
4. **Minha Operação** — lucro estimado, gastos estimados, cashback e economia com taxa reduzida; leva para a aba Operação.
5. **Meu Veículo** — dois modos: veículo próprio (status, próxima revisão, documentação) ou alugado (proprietário, próximo pagamento, próxima manutenção, mensagens), lendo os mocks de proprietário e oficina.
6. **Oportunidades** — parceiro próximo, posto com cashback, oficina em promoção e alta demanda na região, alimentado pelos dados de parceiros/marketplace já existentes.
7. Mantém os atalhos atuais (orçamento, aluguel, parceiros) no rodapé da Home.

O card de check-in continua no topo quando o dia não está liberado.

## Quatro estados de operação

Controlados por um estado simples na store (`offline | online | em_corrida | fim_do_dia`), sem alterar `checkinValido` nem as ações de corrida existentes.

1. **Offline** — Home completa (acima).
2. **Online** — tela de Rodar com mapa ocupando quase tudo, faixa superior com ganhos/corridas/meta e camadas de áreas de demanda, parceiros e benefícios próximos. Mapa mock estilizado (sem biblioteca externa/SDK).
3. **Em corrida** — reaproveita `/motorista/corridas/$id` em modo limpo: mapa, destino, passageiro, chat, emergência e compartilhar viagem.
4. **Fim do dia** — resumo diário: ganhos, lucro, custos, cashback, economia em taxas e progresso no nível, com botão para encerrar/voltar ao offline.

## Clube TCHI LÉVA (`/motorista/clube`)

Uma experiência única com abas, sem duplicar código:
- **Meu nível**: `NivelHero`, `ManutencaoCard`, `RitmoSemanal`, `SimuladorProximoNivel`, `TimelineNiveis`, `HistoricoNiveis` (todos já prontos).
- **Benefícios**: atuais vs. bloqueados do próximo nível.
- **Parceiros**: lista atual de oficinas/parceiros com desconto.
- **Missões**, **Ranking** (novo, mock regional do Grajaú), **Conquistas** e **Economia obtida**.

## Minha Operação (`/motorista/operacao`)

Novo módulo financeiro do motorista:
- Ganhos, custos (combustível, aluguel, manutenção, taxas), lucro e rentabilidade;
- Custo por quilômetro e lucro por hora;
- Histórico financeiro por dia/semana/mês com filtros (reutiliza `FiltroBar`);
- Bloco do veículo: contrato de aluguel, próximos pagamentos e agendamentos no Centro de Serviços;
- Atalhos para pedir orçamento e alugar carro.

## Integração com o ecossistema

Leitura dos mocks já existentes, sem duplicar dados:
- Proprietário (`mock-proprietario`): contrato, pagamentos, veículo alugado, mensagens;
- Centro de Serviços (`mock-oficina`): próxima revisão, histórico e saúde do veículo;
- Marketplace/Parceiros (`mock-parceiro`, `marketplace-inteligente`): promoções, cupons, cashback;
- Camada de sugestões ("IA") reaproveitando o motor de oportunidades para gerar alertas contextuais.

## Detalhes técnicos

- Novos arquivos: `src/routes/motorista.clube.tsx` (+ abas), `src/routes/motorista.operacao.tsx`, `src/routes/motorista.rodar.tsx`, e componentes em `src/components/motorista/` (HeaderMotorista, CardMeuNivel, ResumoDoDia, CardOperacao, CardMeuVeiculo, CardOportunidades, MapaMock, ResumoFimDoDia).
- Novo mock `src/lib/mock-operacao.ts` (custos, KM, meta diária) e extensão da store `src/lib/store.ts` com `statusOperacao`, tempo online e meta — sem mexer nas ações já existentes.
- `/motorista/jornada` e `/motorista/beneficios` permanecem válidas e passam a renderizar dentro do Clube; `sitemap[.]xml.ts` atualizado.
- Nenhum banco de dados; tudo continua em mocks + Zustand persistido.
