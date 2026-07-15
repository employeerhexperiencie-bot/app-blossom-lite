## Objetivo
Adotar os 5 personagens da imagem enviada como avatares oficiais dos níveis do motorista e renomear os níveis intermediários para bater com a nomenclatura da arte.

## Renomeações
| # | Nome atual | Novo nome | Chave (key) |
|---|---|---|---|
| 1 | Peregrino | Peregrino | `peregrino` (mantém) |
| 2 | Caixa Baixa | **Juvenil** | `juvenil` (renomeia) |
| 3 | De Responsa | **Calça Branca** | `calca-branca` (renomeia) |
| 4 | Bigode | Bigode | `bigode` (mantém) |
| 5 | Veinho | Veinho | `veinho` (mantém) |

As faixas de viagens (0–1k, 1k–2k, …), taxas fixas (R$3 → R$1), gradientes e benefícios permanecem exatamente iguais — só nome, frase e imagem mudam nos níveis 2 e 3.

## Ativos (imagens)
- Recortar os 5 personagens da imagem `IMG-20260714-WA0036.jpg` em 5 PNGs individuais com fundo transparente (um por boneco).
- Subir cada um via `lovable-assets` e substituir os pointers atuais:
  - `src/assets/nivel-peregrino.png` → boneco 1 (mochileiro com mapa)
  - `src/assets/nivel-juvenil.png` (novo) → boneco 2 (camiseta laranja) — remover `nivel-caixa-baixa.png`
  - `src/assets/nivel-calca-branca.png` (novo) → boneco 3 (terno + calça branca) — remover `nivel-de-responsa.png`
  - `src/assets/nivel-bigode.png` → boneco 4 (braços cruzados, bigode)
  - `src/assets/nivel-veinho.png` → boneco 5 (grisalho, óculos, musculoso)

## Código a ajustar
- **`src/lib/niveis.ts`**: renomear as keys `caixa-baixa` → `juvenil` e `de-responsa` → `calca-branca`, trocar `nome`, `frase`, `ilustracao` e os imports. Atualizar `historicoMeses` e `conquistasMock` que referenciam as keys antigas.
- **`src/styles.css`**: renomear as CSS vars `--nivel-caixa-baixa`/`--gradient-caixa-baixa` → `--nivel-juvenil`/`--gradient-juvenil` e `--nivel-de-responsa`/`--gradient-de-responsa` → `--nivel-calca-branca`/`--gradient-calca-branca` (mantendo as cores).
- **Textos hardcoded**: buscar por "Caixa Baixa" e "De Responsa" no projeto (ex.: benefícios que citam "R$ 1,00 a menos que o Peregrino", "Selo Caixa Baixa no perfil") e reescrever para "Selo Juvenil" e afins.

## Preservado (não muda)
- Rotas, telas, fluxos, `store.ts`, componentes (`NivelHero`, `TimelineNiveis`, `HistoricoNiveis`, `NivelBadge`).
- Faixas de viagem, taxas fixas, gradientes de cor, regras de manutenção, missões, simulador.
- Identidade visual TCHI LÉVA (fontes, tokens, grain, tag-stroke).

## Validação
- Rodar o app e conferir `/motorista` e `/motorista/jornada`: hero, timeline, badges e histórico devem mostrar os 5 novos avatares e nomes corretos, sem quebrar layout.
