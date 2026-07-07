# Rotina — Assistente Pessoal

Dashboard dark para rastreamento de rotina diária: suplementos, treino, peso, composição corporal e desafio pessoal.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **PostgreSQL** via Railway
- **Prisma 7** (ORM)
- **Tailwind CSS v4** + shadcn/ui
- **Recharts** (gráficos)

---

## Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados local

Crie um PostgreSQL local (via Docker ou instalação direta) e configure o `.env`:

```bash
cp .env.example .env
# Edite .env com sua DATABASE_URL
```

### 3. Gerar o Prisma client e aplicar schema

```bash
npm run db:generate
npm run db:push      # aplica schema sem migração (dev)
# OU
npm run db:migrate   # aplica migrações (produção)
```

### 4. Seed inicial (suplementos + baselines do desafio)

```bash
npm run db:seed
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Abrir em [http://localhost:3000](http://localhost:3000)

---

## Deploy no Railway

### 1. Criar projeto Railway

- Acesse [railway.app](https://railway.app) e crie um novo projeto
- Adicione o plugin **PostgreSQL** — a variável `DATABASE_URL` é configurada automaticamente

### 2. Conectar repositório

- No Railway, conecte seu repositório GitHub
- O `railway.json` já tem os comandos de build e start configurados

### 3. Variáveis de ambiente

O Railway injeta `DATABASE_URL` automaticamente. Nenhuma outra variável é necessária.

### 4. Seed após primeiro deploy

No Railway Shell (ou via CLI):

```bash
npm run db:seed
```

### 5. Domínio

No painel Railway → Settings → Domains → Generate Domain. A URL padrão é `*.up.railway.app`.

---

## Estrutura de pastas

```
app/
  (dashboard)/
    layout.tsx           # Sidebar + header
    page.tsx             # Dashboard principal
    suplementos/page.tsx
    treino/page.tsx
    peso/page.tsx
    desafio/page.tsx
  api/
    dashboard/route.ts
    suplementos/route.ts + [id]/route.ts + registros/route.ts
    treino/route.ts + [id]/route.ts
    peso/route.ts + [id]/route.ts
    desafio/route.ts + julia/route.ts + julia/[id]/route.ts
  globals.css
  layout.tsx             # Root layout (html, body, fonts)
components/
  sidebar.tsx
  dashboard/             # Cards do dashboard
  suplementos/           # Registro diário + configuração
  treino/                # CRUD de sessões
  peso/                  # Medidas + gráficos
  desafio/               # Comparativo Filipe vs Julia
lib/
  db.ts                  # Prisma client singleton
  db/suplementos.ts, treino.ts, peso.ts, desafio.ts
prisma/
  schema.prisma
  seed.ts
```

---

## Como adicionar um novo módulo

1. Adicione o model em `prisma/schema.prisma` e rode `npm run db:migrate`
2. Crie `lib/db/[modulo].ts` com as queries
3. Crie `app/api/[modulo]/route.ts` e `[id]/route.ts`
4. Crie `components/[modulo]/` com os componentes de UI
5. Crie `app/(dashboard)/[modulo]/page.tsx`
6. Adicione o link na sidebar em `components/sidebar.tsx`

Siga exatamente o padrão dos módulos existentes.

---

## Módulos futuros planejados (Fase 2+)

- Sono (horário deitar/acordar, qualidade 1-5)
- Estudo (matéria, horas, tópico)
- Estágio (horas InCeres, tarefas)
- Financeiro (receitas, gastos, categorias)
- Graduação (grade horária, matérias, faltas, notas)
- Chat com Claude (integração API Anthropic)
