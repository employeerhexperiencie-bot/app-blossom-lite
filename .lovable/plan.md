# Jornada do Motorista — Sistema de Níveis Conect (sem banco)

100% front-end com mock data. Três níveis de progressão: **Peregrino → Bigode → Veinho**, cada um com identidade visual própria, ilustração de personagem e benefícios crescentes.

## Os 3 níveis

| Nível | Faixa | Tom visual | Bônus |
|---|---|---|---|
| **Peregrino** — "Em jornada" | 0–199 corridas | Areia + bronze | Acesso ao clube, 5% cashback base |
| **Bigode** — "Na estrada há tempo" | 200–999 corridas | Laranja Conect + grafite | +5% cashback, prioridade em aluguéis |
| **Veinho** — "Lenda da pista" | 1000+ corridas | Dourado + preto | +15% cashback, caução -50%, VIP |

Motorista demo começa como **Bigode com 412 corridas** (mid-journey, mostra progressão).

## Onde a identidade aparece

1. **Home (`/motorista/`)** — `NivelHero` no topo: avatar com anel de progresso SVG, nome do nível, ilustração do personagem, barra "412/1000 para Veinho". Card de ganho do dia vira secundário.
2. **Nova rota `/motorista/jornada`** — Hero + missões da semana + timeline vertical dos 3 níveis (passado check, atual destaque, futuro silhueta) + lista de conquistas.
3. **Bottom tab bar** — nova aba **Jornada** (ícone Trophy), 5 abas no total.
4. **Header global** — mini-badge do nível ao lado do avatar + moldura colorida do nível no avatar.

## Identidade visual (tokens em `src/styles.css`)

```
--nivel-peregrino, --nivel-bigode, --nivel-veinho
--gradient-peregrino, --gradient-bigode, --gradient-veinho
```

3 ilustrações geradas dos personagens em `src/assets/nivel-*.png` (já criadas: Peregrino com mochila, Bigode com bigode marcante e óculos, Veinho idoso com chapéu).

## Arquivos

**Criar:**
- `src/lib/niveis.ts` — config dos níveis, helpers (`getNivelByCorridas`, `getProximoNivel`), missões e conquistas mock
- `src/components/nivel/NivelBadge.tsx`
- `src/components/nivel/NivelHero.tsx` — card com anel SVG de progresso
- `src/components/nivel/MissaoCard.tsx`
- `src/components/nivel/TimelineNiveis.tsx`
- `src/routes/motorista.jornada.tsx`
- `src/assets/nivel-peregrino.png`, `nivel-bigode.png`, `nivel-veinho.png` ✓

**Editar:**
- `src/styles.css` — tokens dos 3 níveis
- `src/routes/motorista.tsx` — adiciona aba Jornada, mini-badge e moldura no header
- `src/routes/motorista.index.tsx` — substitui hero pelo `NivelHero`

## Fora de escopo
Sem backend, sem modal de "subiu de nível", sem leaderboard, sem níveis para outros perfis.
