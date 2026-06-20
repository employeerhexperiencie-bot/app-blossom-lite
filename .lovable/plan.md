# Reformulação dos níveis + painel de evolução do motorista

Tudo continua **100% front-end com dados mockados** (sem banco). O foco desta etapa é (1) trocar o modelo de cashback% por **taxa fixa por viagem** e (2) dar ao motorista uma forma clara e diária de **acompanhar a própria evolução** dentro do mês e ao longo dos níveis.

## 1. Novos 5 níveis (1.000 viagens cada)

| Nível         | Viagens acumuladas | Taxa Conect / viagem |
| ------------- | ------------------ | -------------------- |
| Peregrino     | 0 – 999            | R$ 3,00              |
| Caixa Baixa   | 1.000 – 1.999      | R$ 2,00              |
| De Responsa   | 2.000 – 2.999      | R$ 1,50              |
| Bigode        | 3.000 – 3.999      | R$ 1,00              |
| Veinho        | 4.000+             | R$ 1,00 + benefícios extras (caução -50%, prioridade em aluguel, descontos reforçados em oficinas) |

## 2. Regras mensais de manutenção

No fechamento do mês, se qualquer regra falhar → **desce 1 nível e zera o progresso**:
- Mínimo **3 caronas solidárias** no mês.
- **Menos de 100 rejeições** no mês.
- Manter **média mínima de estrelas** (placeholder 4,7).

XP extra: elogios além das 5★ e caronas solidárias aceleram a subida.

## 3. Como o motorista acompanha a evolução

Esse é o coração da experiência. Três camadas de leitura:

### a) Glance — Home (`/motorista/`)
- **NivelHero** redesenhado: nome do nível, **taxa fixa atual em destaque** ("Você paga R$1,50 por viagem"), anel de progresso (viagens no nível atual / 1.000) e CTA "Ver minha jornada".
- **StatusMesStrip**: faixa compacta com 3 chips coloridos (verde/âmbar/vermelho):
  - Caronas 2/3
  - Rejeições 38/100
  - Estrelas 4,82 / 4,70
- Mini "economia do mês": *"Você economizou R$ 84 em taxas este mês vs. Peregrino."*

### b) Deep dive — `/motorista/jornada`
- **Timeline dos 5 níveis** com taxa, requisitos e marcador "você está aqui".
- **Card Manutenção do Mês** detalhado: cada regra com barra de progresso, status (ok / atenção / em risco) e dias restantes do mês.
- **Histórico de níveis** (mock): lista simples dos últimos 6 meses mostrando nível mantido/perdido/promovido.
- **Gráfico de viagens por semana** (componente leve, sem libs externas — barras CSS) mostrando ritmo necessário para o próximo nível.
- **Missões da semana** (`MissaoCard` ajustado): "Dê 1 carona solidária", "Mantenha rejeições <25 esta semana", "Receba 5 elogios".
- **Simulador**: slider "Se eu fizer +X viagens este mês, economizo R$Y e chego ao próximo nível em Z dias."

### c) Ambient — em todo o app
- Badge de nível no avatar (já existe) — adicionar 2 cores novas.
- Toast/banner sutil quando uma regra entra em "risco" (ex: faltam 5 dias e ainda 0 caronas).

## 4. Arquivos a tocar

- `src/lib/niveis.ts` — trocar `NIVEIS` por 5 níveis com `taxaFixa`; adicionar `progressoNivel()`, `regrasManutencao()`, `economiaMes()`, `simularProximoNivel()`.
- `src/lib/mock-data.ts` + `src/lib/store.ts` — expandir `ProgressoMotorista` (viagensTotais, viagensMes, caronasMes, rejeicoesMes, mediaEstrelas, elogiosMes, historicoMeses, viagensPorSemana).
- `src/styles.css` — 2 novos tokens (Caixa Baixa, De Responsa).
- `src/components/nivel/NivelHero.tsx` — redesign com taxa fixa em destaque.
- `src/components/nivel/TimelineNiveis.tsx` — 5 etapas.
- `src/components/nivel/MissaoCard.tsx` — missões alinhadas às novas regras.
- **Novos**: `StatusMesStrip.tsx`, `ManutencaoCard.tsx`, `HistoricoNiveis.tsx`, `RitmoSemanal.tsx`, `SimuladorProximoNivel.tsx`.
- `src/routes/motorista.index.tsx` — Hero + StatusMesStrip + economia do mês.
- `src/routes/motorista.jornada.tsx` — timeline + manutenção + histórico + ritmo + simulador.

## 5. Fora de escopo
- Backend, persistência real, fechamento automático de mês.
- Novas ilustrações para Caixa Baixa e De Responsa (reaproveitar paleta + badge; gerar imagens depois se quiser).
- Aplicar taxa fixa nas telas de aluguel/benefícios além da menção informativa.
