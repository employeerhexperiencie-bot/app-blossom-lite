## Objetivo
Adotar o grafite enviado como logo oficial e substituir todas as menções a "Conect" por **TCHI LÉVA** no app.

## Escopo textual (user-facing)
Substituir em todos os textos exibidos ao usuário:
- Títulos de páginas (`head().meta.title`): "— Conect" → "— TCHI LÉVA" (26 rotas).
- Strings de UI: `AppShell title="Conect"`, "Membro Conect", "Loja parceira Conect", "Motorista Conect · São Paulo", "motoristas Conect", "usuários Conect", "Taxa Conect (…)", "Clube do Motorista Conect", "Acesso administrador Conect", "Conect." no hero da home, "Conect — Admin" etc.
- Comentário `mock-data.ts`: "Conect MVP" → "TCHI LÉVA MVP".

## Preservado (identificadores de código — NÃO renomear)
Para não quebrar o app, mantemos os símbolos internos:
- `useConect` hook (store)
- `ConectState` type
- Chave de persistência do zustand `"conect-state"` (renomear apagaria o estado salvo dos usuários)

Isso é invisível ao usuário — só aparece no código-fonte.

## Logo
- Subir `IMG-20260628-WA0007.jpg` via `lovable-assets` como `src/assets/tchileva-logo.png.asset.json` (logo cheio para telas grandes).
- Gerar um favicon quadrado 512×512 focado no lettering verde "TCHI LÉVA" (recortando do arquivo) e salvar em `public/favicon.png`; remover `public/favicon.ico`.
- Atualizar `src/routes/__root.tsx` para trocar `{ rel: "icon", href: "/favicon.ico" }` por `{ rel: "icon", type: "image/png", href: "/favicon.png" }` e ajustar `title`/`description` para TCHI LÉVA.
- Atualizar `src/components/BrandMark.tsx` para usar o novo logo (mantém API do componente para não mexer no `AppShell`).
- Substituir o `tchileva-mark.png` atual (que era um mock antigo) pelo novo asset.

## Home / Auth
- `src/routes/index.tsx`: no hero da landing, trocar palavra "Conect." pelo brandmark TCHI LÉVA (imagem grande do logo).
- `src/routes/auth.tsx`: substituir menções "Conect" e usar o logo no topo do card de login.

## Validação
- `rg -n "Conect|conect" src/` deve retornar apenas `useConect`, `ConectState`, `"conect-state"` (código interno).
- Abrir `/`, `/auth`, `/motorista`, `/admin` e conferir header/favicon/títulos.
