import { prisma } from "@/lib/db"

// Usa horário de Brasília (UTC-3) para determinar o dia atual.
// Às 21:30 Brazil ainda é o mesmo dia — UTC puro avançaria para o próximo.
function dataHoje(): Date {
  const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000)
  return new Date(Date.UTC(brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate()))
}

function proximoDia(): Date {
  const hoje = dataHoje()
  return new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + 1))
}

export async function logDeHoje() {
  // Use gte/lt range instead of exact match — more robust with @db.Date + PrismaPg adapter
  return prisma.dailyLog.findFirst({
    where: { date: { gte: dataHoje(), lt: proximoDia() } },
  })
}

export async function definirTipoDia(dayType: string) {
  const hoje = dataHoje()
  const amanha = proximoDia()
  // findFirst + update/create avoids PrismaPg @db.Date upsert-where comparison issues
  const existente = await prisma.dailyLog.findFirst({
    where: { date: { gte: hoje, lt: amanha } },
  })
  if (existente) {
    return prisma.dailyLog.update({ where: { id: existente.id }, data: { dayType } })
  }
  return prisma.dailyLog.create({ data: { date: hoje, dayType } })
}

export async function atualizarLogNoite(
  id: string,
  data: {
    resistanceAvg?: number | null
    executedSomething?: boolean | null
    dayLost?: boolean | null
    freeNote?: string | null
  }
) {
  return prisma.dailyLog.update({ where: { id }, data })
}

export async function historicoLog(dias = 14) {
  const hoje = dataHoje()
  const desde = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() - dias))
  return prisma.dailyLog.findMany({
    where: { date: { gte: desde } },
    orderBy: { date: "desc" },
  })
}
