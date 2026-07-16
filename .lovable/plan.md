## Objetivo
Substituir os 5 avatares dos níveis usando a nova imagem enviada (`IMG-20260715-WA0043.jpg`), recortando cada boneco individualmente e mantendo apenas o personagem (sem os selos numerados de cima).

## Passos

1. **Recortar os 5 personagens** da imagem `user-uploads://IMG-20260715-WA0043.jpg` com Python/PIL:
   - Detectar as 5 colunas (imagem tem fundo branco uniforme)
   - Recortar apenas a região do boneco (abaixo dos selos "1/2/3/4/5"), preservando fundo transparente
   - Salvar em `/tmp/nivs/peregrino.png`, `juvenil.png`, `calca-branca.png`, `bigode.png`, `veinho.png` (PNG com transparência)

2. **Substituir os assets existentes** via `lovable-assets`:
   - Deletar os 5 `.asset.json` atuais (`src/assets/nivel-{peregrino,juvenil,calca-branca,bigode,veinho}.png.asset.json`)
   - Recriar cada um a partir do novo PNG recortado, mantendo o mesmo nome de arquivo
   
3. **Não alterar código**: `src/lib/niveis.ts`, `NivelHero.tsx`, `TimelineNiveis.tsx` e demais componentes continuam apontando para os mesmos imports — só o conteúdo dos assets muda.

## Preservado
- Todas as rotas, telas, fluxos, keys (`peregrino`, `juvenil`, `calca-branca`, `bigode`, `veinho`), gradientes, taxas e nomenclatura.
- Selos coloridos (`NivelBadge`) permanecem como estão — os selos "1/2/3/4/5" da imagem NÃO entram como asset (o app já tem seu próprio sistema de badge).

## Validação
- Abrir `/motorista/jornada` no preview e conferir hero + timeline mostrando os 5 novos avatares limpos.
