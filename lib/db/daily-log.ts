import { prisma } from "@/lib/db"

// Always use UTC date to avoid timezone drift on Railway (UTC) and local dev
function dataHojeUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function proximoDiaUTC(): Date {
  const hoje = dataHojeUTC()
  return new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + 1))
}

export async function logDeHoje() {
  // Use gte/lt range instead of exact match — more robust with @db.Date + PrismaPg adapter
  return prisma.dailyLog.findFirst({
    where: { date: { gte: dataHojeUTC(), lt: proximoDiaUTC() } },
  })
}

export async function definirTipoDia(dayType: string) {
  const hoje = dataHojeUTC()
  const amanha = proximoDiaUTC()
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
  const desde = new Date()
  desde.setDate(desde.getDate() - dias)
  desde.setHours(0, 0, 0, 0)
  return prisma.dailyLog.findMany({
    where: { date: { gte: desde } },
    orderBy: { date: "desc" },
  })
}
