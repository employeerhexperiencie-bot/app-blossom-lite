
# Plano: Conect como Ecossistema de Mobilidade

Reorganizar o app de "app de corridas com níveis" para **ecossistema** com 6 atores conectados em ciclo. Tudo ainda em mock (sem backend), focado em estruturar fluxos e telas.

---

## 1. Mapa de rotas alvo

```
/                          landing do ecossistema (escolher perfil)
/auth                      cadastro + validação documental (mock)
/onboarding/$perfil        tour do perfil escolhido

/motorista                 home (nível, ganhos, missões)
/motorista/checkin         NOVO — selfie + 3 fotos do carro + IA mock
/motorista/corridas        NOVO — fila de corridas (aceitar/recusar)
/motorista/corridas/$id    NOVO — corrida em andamento
/motorista/jornada         trajetória de níveis (já existe)
/motorista/beneficios      parceiros (já existe)
/motorista/orcamentos      NOVO — pedir orçamento p/ oficinas
/motorista/alugueis        aluguel de carros (já existe)
/motorista/perfil

/passageiro                home
/passageiro/solicitar      NOVO — origem/destino/valor
/passageiro/corrida/$id    NOVO — em andamento + SOS + compartilhar
/passageiro/cashback       já existe
/passageiro/parceiros      já existe
/passageiro/perfil

/proprietario              dashboard
/proprietario/frota/novo   cadastro de veículo
/proprietario/frota/$id    detalhe + propostas
/proprietario/propostas    NOVO — aprovar/rejeitar motoristas
/proprietario/financeiro

/oficina                   dashboard (pedidos + agenda)
/oficina/orcamentos        NOVO — responder pedidos
/oficina/agenda
/oficina/promocoes
/oficina/avaliacoes        NOVO

/loja                      dashboard
/loja/campanhas            cashback/descontos
/loja/clientes             NOVO — quem veio do Conect

/admin                     NOVO — área completa
/admin/kpis                corridas, faturamento, ativos
/admin/moderacao           denúncias, bloqueios, recursos
/admin/financeiro          repasses, taxas, comissões
/admin/parceiros           aprovar oficinas/lojas/frotistas

/seguranca/denuncia        NOVO — fluxo único p/ todos os perfis
```

---

## 2. Telas/funcionalidades novas (prioridade)

**Fase A — fechar a jornada do motorista (núcleo do ciclo)**
1. `/motorista/checkin` — selfie + 3 fotos (frontal/traseira/interna) com mock de validação por IA (limpeza, danos, consistência). Sem check-in do dia → home bloqueia "Receber corridas".
2. `/motorista/corridas` — lista de corridas mockadas (origem, destino, valor, distância, R$/km). Botão aceitar/recusar.
3. `/motorista/corridas/$id` — corrida em andamento (mapa estático mock, finalizar, registrar viagem que conta para o nível).
4. `/motorista/orcamentos` — formulário "descrever serviço" + lista de respostas mock de oficinas.

**Fase B — fechar o ciclo passageiro ↔ loja**
5. `/passageiro/solicitar` + `/passageiro/corrida/$id` com SOS, compartilhar, avaliar.
6. Cashback gerado na corrida → aparece em `/passageiro/cashback` e pode ser "gasto" em `/passageiro/parceiros` (mock de uso).

**Fase C — proprietário e oficina como ofertantes**
7. `/proprietario/propostas` — motoristas interessados em alugar.
8. `/oficina/orcamentos` — caixa de entrada espelhando pedidos de motoristas.
9. `/oficina/avaliacoes`.

**Fase D — administrador (ator invisível)**
10. `/admin` com 4 abas: KPIs, moderação, financeiro, parceiros. Acesso por toggle no perfil (mock, sem auth real).

**Fase E — segurança transversal**
11. `/seguranca/denuncia` — fluxo único (abertura → evidências → análise → decisão → recurso) acessível dos 5 perfis.

---

## 3. Ajustes no que já existe

- **Landing `/`**: virar "escolha seu perfil" com 5 cards (motorista, passageiro, proprietário, oficina, loja) + link discreto admin.
- **Home motorista**: adicionar card "Check-in do dia" obrigatório no topo; bloquear "Receber corridas" sem check-in.
- **`/motorista/jornada`**: manter, mas a contagem de viagens passa a vir das corridas finalizadas em `/motorista/corridas/$id` (ainda mock, mas com `store.ts`).
- **Benefícios**: ligar com `/motorista/orcamentos` (CTA "pedir orçamento" no detalhe do parceiro).
- **Tab bars de cada perfil**: atualizar para refletir as novas rotas principais.

---

## 4. Mock data e estado

Expandir `src/lib/mock-data.ts` e `src/lib/store.ts` com:
- `corridasDisponiveis`, `corridasMinhas`, `corridaAtual`
- `checkinDoDia` (data + status IA)
- `orcamentos` (motorista ↔ oficina, com estados)
- `propostasAluguel` (motorista ↔ proprietário)
- `denuncias` (compartilhado entre perfis e admin)
- `cashbackPassageiro` + `usosCashback`
- `kpisAdmin` derivados dos arrays acima

Tudo síncrono, em memória, sem Lovable Cloud nesta etapa.

---

## 5. Identidade visual

- Manter paleta/tokens atuais dos níveis.
- Criar cor/ícone para cada um dos 6 atores (já temos 5; falta admin) — usado nos cards da landing e nas tab bars.
- Componente compartilhado `EcossistemaCiclo` (diagrama simples) na landing mostrando o ciclo "motorista → corrida → passageiro → cashback → loja → ...".

---

## 6. O que fica fora deste plano

- Lovable Cloud / banco / auth real.
- Validação real de CPF/CNH/selfie (mock de "Aprovado" após 1.5s).
- Mapa real (placeholder estático).
- Pagamento real.
- Fechamento automático de mês (mantém mock dos níveis).

---

## 7. Ordem de execução sugerida

1. Landing nova + rota `/admin` esqueleto.
2. Fase A (motorista completo: checkin → corridas → orçamentos).
3. Fase B (passageiro completo + ciclo de cashback).
4. Fase C (proprietário + oficina ofertantes).
5. Fase D (admin com dados derivados).
6. Fase E (denúncia transversal).

Posso começar pela **Fase A** assim que aprovar — é o que destrava o ciclo todo, porque cria as corridas que alimentam passageiro, cashback, lojas e KPIs do admin.
