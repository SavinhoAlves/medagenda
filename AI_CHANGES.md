# AI Changes Log

Registro de todas as alterações feitas pela IA no projeto MedAgenda.
Cada entrada documenta o que foi solicitado, o que foi alterado e como reverter caso necessário.

---

## Como usar este log

- **Reverter um commit inteiro:** `git revert <hash>` (cria um commit de desfazer sem apagar histórico)
- **Reverter um arquivo específico:** `git checkout <hash>^ -- caminho/do/arquivo`
- **Ver o que mudou em um commit:** `git show <hash> --stat`
- **Ver diff completo de um commit:** `git show <hash>`

---

## [2026-06-23] — Assistente IA flutuante + correções de dark mode, auth e EMR

**Commit:** `a010f31`
**Sessões:** 2 (continuação da sessão anterior)

---

### #01 — Topbar sempre no modo escuro em light mode

**Solicitação:**
> "o topbar fica no modo dark quando a pagina está no modo light"

**O que foi feito:**
- Movido o bloco `:root { ... }` com todas as variáveis CSS de `dashboard.vue` para `dark.css` (arquivo global carregado antes dos componentes)
- Removida a seção HEADER do `dark.css` que tinha nomes de classe incorretos (`.user-name`, `.router-link-active`)
- Reescrito todo o `<style scoped>` do `Header.vue` para usar CSS variables em vez de cores hardcoded

**Arquivos alterados:**
- `frontend/assets/css/dark.css` — adicionado `:root {}` com variáveis de luz; removida seção HEADER incorreta
- `frontend/layouts/dashboard.vue` — removido bloco `:root {}` duplicado
- `frontend/components/layout/Header.vue` — estilos migrados para CSS variables

**Como reverter:**
```bash
git checkout 20119fa -- frontend/assets/css/dark.css
git checkout 20119fa -- frontend/layouts/dashboard.vue
git checkout 20119fa -- frontend/components/layout/Header.vue
```

---

### #02 — Topbar da página EMR sempre escura

**Solicitação:**
> "Ajuste o topbar que esta em /pages/consultas/[id].vue"

**O que foi feito:**
- Topbar do EMR corrigido para responder ao tema:
  `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`
- Botão de voltar, badges de status e textos adaptados com classes `dark:`

**Arquivos alterados:**
- `frontend/pages/consultas/[id].vue` — header do EMR com classes Tailwind dark mode

**Como reverter:**
```bash
git checkout 20119fa -- frontend/pages/consultas/[id].vue
```

---

### #03 — Espaçamento excessivo na página EMR

**Solicitação:**
> "Ajuste as margens e os paddings"

**O que foi feito:**
- `p-6` → `p-4` no container principal
- Removido `max-w-3xl mx-auto` (conteúdo agora usa a largura total)
- Card do paciente: `p-4` → `p-3`, avatar `w-10 h-10` → `w-9 h-9`
- Gaps e paddings internos reduzidos em ~25% por toda a página
- Espaçador inferior: `h-10` → `h-4`

**Arquivos alterados:**
- `frontend/pages/consultas/[id].vue` — paddings e gaps ajustados

**Como reverter:**
```bash
git checkout 20119fa -- frontend/pages/consultas/[id].vue
```

---

### #04 — Médico redirecionado para /dashboard no login

**Solicitação:**
> "Quando atualizo a pagina, no login cargo médico ele é redirecionado para a dashboard sendo que os menus disponíveis pra ele são apenas Agenda, minhas consultas e Pacientes."

**O que foi feito:**
- `login.vue`: adicionado `|| cargo === 'medico'` na condição de redirect → agora médico vai para `/agenda`
- `dashboard.vue`: middleware trocado de `nao-operador` para `apenas-admin`
- `apenas-admin.js`: simplificado o ternário

**Arquivos alterados:**
- `frontend/pages/login.vue` — condição de redirect após login
- `frontend/pages/dashboard.vue` — middleware `apenas-admin`
- `frontend/middleware/apenas-admin.js` — limpeza do ternário

**Como reverter:**
```bash
git checkout 20119fa -- frontend/pages/login.vue
git checkout 20119fa -- frontend/pages/dashboard.vue
git checkout 20119fa -- frontend/middleware/apenas-admin.js
```

---

### #05 — Loop de redirect ao atualizar a página

**Solicitação:**
> "Um fato que tem acontecido é que quando atualiza a pagina, ele deveria ficar naquela pagina, mas ele so redireciona para outra pagina"

**O que foi feito:**
- Criado `frontend/plugins/auth.client.js` — chama `carregarUsuario()` antes dos middlewares de rota
- Reescrito `middleware/medico.js` — adicionado guard `process.client` e null-check do cargo
- Simplificado `middleware/auth.js` — apenas verifica token no localStorage

**Arquivos alterados:**
- `frontend/plugins/auth.client.js` — **NOVO** — popula auth store antes dos middlewares
- `frontend/middleware/medico.js` — reescrito com guards corretos
- `frontend/middleware/auth.js` — simplificado

**Risco:** baixo — a lógica anterior causava loop de redirect. A nova abordagem usa o ciclo de plugins do Nuxt 4.

**Como reverter:**
```bash
git checkout 20119fa -- frontend/middleware/medico.js
git checkout 20119fa -- frontend/middleware/auth.js
git rm frontend/plugins/auth.client.js
```

---

### #06 — Ícone do menu "Minhas Consultas"

**Solicitação:**
> "Ajuste o icone do menu 'Minhas consultas'"

**O que foi feito:**
- Importação trocada: `Clipboard` → `ClipboardList` no `Header.vue`

**Arquivos alterados:**
- `frontend/components/layout/Header.vue` — ícone do menu

**Como reverter:**
```bash
# Editar manualmente Header.vue: trocar ClipboardList por Clipboard
```

---

### #07 — Menu "Minhas Consultas" ativo durante atendimento

**Solicitação:**
> "quando o medico inicia o atendimento, o menu minhas consultas devera permanecer ativo"

**O que foi feito:**
- A função `isActive(rota)` já usava `startsWith(rota + '/')`, portanto `/consultas/123/atendimento` já ativava o item `/consultas`
- O real problema era `isMedico` sendo `false` no render inicial (auth store vazio)
- Resolvido pelo plugin `auth.client.js` da alteração #05

**Arquivos alterados:**
- Nenhum arquivo adicional — resolvido como efeito colateral do #05

---

### #08 — Assistente IA flutuante com 4 modos

**Solicitação:**
> "É possivel criar um botão flutuante com IA para que o usuario solicite melhorias e essa ia construa isso internamente? Ele deve executar todas as ações das opções dadas anteriormente."

**O que foi feito:**

**Backend:**
- `backend/prisma/schema.prisma` — adicionado modelo `Sugestao` (tabela `sugestoes`)
- `backend/prisma/migrations/20260623045926_add_sugestoes/migration.sql` — migration criada e aplicada
- `backend/src/controllers/iaController.js` — **NOVO** — 4 funções: `chat`, `salvarSugestao`, `listarSugestoes`, `atualizarStatusSugestao`
- `backend/src/routes/iaRoutes.js` — **NOVO** — rotas `POST /ia/chat`, `POST/GET /ia/sugestoes`, `PATCH /ia/sugestoes/:id`
- `backend/src/app.js` — montado `/ia` routes
- `backend/.env` — adicionada variável `ANTHROPIC_API_KEY`

**Frontend:**
- `frontend/components/AIAssistant.vue` — **NOVO** — botão flutuante + painel com 4 modos:
  - **Chat** — conversa livre, botão "Salvar sugestão" salva no banco
  - **Specs** — gera especificação técnica completa em Markdown
  - **Ajuda** — assistente contextual ciente da página atual e cargo do usuário
  - **Código** — gera código Vue/Node.js completo com botão "Copiar resposta"
- `frontend/layouts/dashboard.vue` — adicionado `<AIAssistant />`

**Arquivos alterados:**
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260623045926_add_sugestoes/migration.sql`
- `backend/src/controllers/iaController.js` — NOVO
- `backend/src/routes/iaRoutes.js` — NOVO
- `backend/src/app.js`
- `frontend/components/AIAssistant.vue` — NOVO
- `frontend/layouts/dashboard.vue`

**Dependências externas:**
- Requer `ANTHROPIC_API_KEY` válida no `backend/.env`
- Requer créditos ativos em console.anthropic.com (API separada do plano Pro)

**Risco:** médio — adiciona nova tabela no banco e novo endpoint. Não altera tabelas existentes.

**Como reverter completamente:**
```bash
# 1. Remover a tabela do banco
mysql -u root medagenda -e "DROP TABLE sugestoes;"

# 2. Reverter arquivos
git checkout 20119fa -- backend/prisma/schema.prisma
git checkout 20119fa -- backend/src/app.js
git checkout 20119fa -- frontend/layouts/dashboard.vue
git rm backend/src/controllers/iaController.js
git rm backend/src/routes/iaRoutes.js
git rm frontend/components/AIAssistant.vue
git rm backend/prisma/migrations/20260623045926_add_sugestoes/migration.sql
```

---

## [2026-06-23] — Manual do sistema com mockups interativos

**Commit:** `fbe4e7d`

---

### #09 — Manual do sistema com screenshots e vídeos

**Solicitação:**
> "Gere um manual do sistema que mostre como usá-lo, for possivel, gere imagens e videos para que fique bem autoexplicativo"
> "adiciona os screenshots e vídeos no manual (Não sei se você consegue 'ver' o sistema internamente para tirar prints, mas acredito que baseado nos codigos dos arquivos voce consegue criar videos"

**O que foi feito:**
- Criado `docs/manual.html` — manual completo com 15 seções, sidebar de navegação, scroll spy
- Todos os placeholders de screenshot substituídos por mockups HTML/CSS precisos construídos a partir do código-fonte real dos componentes
- Todos os placeholders de vídeo substituídos por story players JavaScript interativos com frames animados:
  - `story-login` (4 frames) — fluxo de login
  - `story-agenda` (5 frames) — agendamento de consulta
  - `story-emr` (4 frames) — prontuário eletrônico
  - `story-ai` (5 frames) — assistente IA flutuante
- Implementadas funções JS: `storyPrev()`, `storyNext()`, `storyToggle()` com timer auto-play e barra de progresso
- Mockups criados: Login, Dashboard, Agenda calendário + modal, Lista de consultas, Prontuário EMR, Pacientes, Convênios, Profissionais, Solicitações de exclusão, Notificações, Painel AI Chat, AI Specs, comparação Tema Claro vs. Escuro
- Adicionada animação `pulse-ring` para o botão FAB da IA no story player

**Arquivos alterados:**
- `docs/manual.html` — **NOVO** — 2.100+ linhas de HTML/CSS/JS

**Risco:** zero — arquivo de documentação, não afeta funcionamento do sistema

**Como reverter:**
```bash
git rm docs/manual.html
# ou para restaurar a versão anterior (sem mockups):
git checkout 8c7ae13 -- docs/manual.html
```

---

## Commits de referência

| Hash | Descrição | Data |
|---|---|---|
| `fbe4e7d` | docs: manual com mockups interativos e story players | 2026-06-23 |
| `8c7ae13` | docs: manual com placeholders (versão anterior) | 2026-06-23 |
| `c668ef6` | docs: AI changes log | 2026-06-23 |
| `a010f31` | feat: AI assistant, dark mode fixes, auth middleware and EMR | 2026-06-23 |
| `20119fa` | feat: EMR atendimento, typeahead paciente, valores profissional | anterior |
| `3728817` | feat: migrate navigation to header, notifications | anterior |
| `bfb18af` | feat: modal pattern, toast system and UI polish | anterior |
| `6bcc3c7` | feat: implement convenio management | anterior |
| `58c4506` | feat: estrutura inicial com modelos e tabelas ajustadas | anterior |
