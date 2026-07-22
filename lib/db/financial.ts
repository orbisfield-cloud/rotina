import { prisma } from "@/lib/db"

function intervaloMes(mes?: number, ano?: number) {
  const now = new Date()
  const m = mes ?? now.getMonth() + 1
  const a = ano ?? now.getFullYear()
  return {
    gte: new Date(a, m - 1, 1),
    lte: new Date(a, m, 0, 23, 59, 59),
  }
}

export async function listarEntradas(mes?: number, ano?: number) {
  return prisma.financialEntry.findMany({
    where: { date: intervaloMes(mes, ano) },
    orderBy: { date: "desc" },
  })
}

export async function resumoMes(mes?: number, ano?: number) {
  const entradas = await listarEntradas(mes, ano)
  const receitas = entradas.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0)
  const despesas = entradas.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0)
  return { receitas, despesas, saldo: receitas - despesas, entradas }
}

export async function criarEntrada(data: {
  date?: string
  type: string
  amount: number
  description: string
  category?: string | null
  method?: string | null
}) {
  return prisma.financialEntry.create({
    data: {
      date: data.date ? new Date(data.date + "T12:00:00.000Z") : new Date(),
      type: data.type,
      amount: data.amount,
      description: data.description,
      category: data.category || null,
      method: data.method || null,
    },
  })
}

export async function atualizarEntrada(
  id: string,
  data: Partial<{ date: string; type: string; amount: number; description: string; category: string | null; method: string | null }>
) {
  const { date, ...rest } = data
  return prisma.financialEntry.update({
    where: { id },
    data: { ...rest, ...(date ? { date: new Date(date + "T12:00:00.000Z") } : {}) },
  })
}

export async function deletarEntrada(id: string) {
  return prisma.financialEntry.delete({ where: { id } })
}

const CATEGORIAS_PADRAO = [
  { name: "Alimentação", icon: "🍽️" },
  { name: "Transporte",  icon: "🚗" },
  { name: "Lazer",       icon: "🎮" },
  { name: "Freela",      icon: "💻" },
  { name: "República",   icon: "🏠" },
  { name: "Saúde",       icon: "🏥" },
  { name: "Outros",      icon: "📦" },
]

export async function listarCategorias() {
  const count = await prisma.financialCategory.count()
  if (count === 0) {
    await prisma.financialCategory.createMany({ data: CATEGORIAS_PADRAO })
  }
  return prisma.financialCategory.findMany({ orderBy: { name: "asc" } })
}

export async function criarCategoria(data: { name: string; icon?: string | null }) {
  return prisma.financialCategory.create({ data })
}

export async function atualizarCategoria(id: string, data: { name?: string; icon?: string | null }) {
  return prisma.financialCategory.update({ where: { id }, data })
}

export async function deletarCategoria(id: string) {
  return prisma.financialCategory.delete({ where: { id } })
}

export async function obterConfig() {
  const c = await prisma.financialConfig.findFirst()
  if (c) return c
  return prisma.financialConfig.create({ data: {} })
}

export async function atualizarConfig(data: { cardLimit: number }) {
  const c = await obterConfig()
  return prisma.financialConfig.update({ where: { id: c.id }, data })
}
