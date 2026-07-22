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

function toDateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

export async function calcularStreak(): Promise<number> {
  const logs = await prisma.dailyLog.findMany({ select: { date: true } })
  const datesSet = new Set(logs.map(l => toDateStr(l.date as Date)))

  const hoje = dataHoje()
  // If no log today yet, start counting from yesterday (don't break streak pre-logging)
  let current = datesSet.has(toDateStr(hoje))
    ? hoje
    : new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() - 1))

  let streak = 0
  while (datesSet.has(toDateStr(current))) {
    streak++
    current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate() - 1))
  }
  return streak
}

export async function resumoSemanal() {
  const hoje = dataHoje()
  const seteDiasAtras = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() - 6))
  const logs = await prisma.dailyLog.findMany({ where: { date: { gte: seteDiasAtras } } })

  const diasBons = logs.filter(l => l.dayType === "good").length
  const diasRuins = logs.filter(l => l.dayType === "bad").length
  const diasPerdidos = logs.filter(l => l.dayLost === true).length
  const rs = logs.filter(l => l.resistanceAvg !== null).map(l => l.resistanceAvg!)
  const resistenciaMedia = rs.length > 0
    ? Math.round(rs.reduce((a, b) => a + b, 0) / rs.length)
    : null

  return { diasBons, diasRuins, diasPerdidos, resistenciaMedia, totalLogs: logs.length }
}
