import { prisma } from "@/lib/db"

function dataHoje() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function logDeHoje() {
  return prisma.dailyLog.findUnique({ where: { date: dataHoje() } })
}

export async function definirTipoDia(dayType: string) {
  const hoje = dataHoje()
  return prisma.dailyLog.upsert({
    where: { date: hoje },
    create: { date: hoje, dayType },
    update: { dayType },
  })
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
