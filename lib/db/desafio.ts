import { prisma } from "@/lib/db"

const BASELINE_DATA = new Date("2026-07-07")
const META_DATA = new Date("2026-09-07")

export const BASELINE_FILIPE = {
  peso: 93.1,
  massaMuscular: 50.9,
  gorduraSubcutanea: 8.6,
}

export const BASELINE_JULIA = {
  peso: 76.15,
  massaMuscular: 38.3,
  gorduraSubcutanea: 18.5,
}

export async function dadosDesafio() {
  const [ultimaFilipe, ultimaJulia, medidasFilipe, medidasJulia] = await Promise.all([
    prisma.medidaCorporal.findFirst({
      where: { pessoa: "filipe" },
      orderBy: { data: "desc" },
    }),
    prisma.medidaCorporal.findFirst({
      where: { pessoa: "julia" },
      orderBy: { data: "desc" },
    }),
    prisma.medidaCorporal.findMany({
      where: { pessoa: "filipe" },
      orderBy: { data: "asc" },
    }),
    prisma.medidaCorporal.findMany({
      where: { pessoa: "julia" },
      orderBy: { data: "asc" },
    }),
  ])

  const hoje = new Date()
  const diasRestantes = Math.max(0, Math.ceil((META_DATA.getTime() - hoje.getTime()) / 86400000))
  const diasTotais = Math.ceil((META_DATA.getTime() - BASELINE_DATA.getTime()) / 86400000)
  const diasDecorridos = diasTotais - diasRestantes

  return {
    diasRestantes,
    diasTotais,
    diasDecorridos,
    filipe: {
      atual: ultimaFilipe,
      deltaMassa: ultimaFilipe?.massaMuscular != null
        ? ultimaFilipe.massaMuscular - BASELINE_FILIPE.massaMuscular
        : null,
      deltaGordura: ultimaFilipe?.gorduraSubcutanea != null
        ? ultimaFilipe.gorduraSubcutanea - BASELINE_FILIPE.gorduraSubcutanea
        : null,
      historico: medidasFilipe,
    },
    julia: {
      atual: ultimaJulia,
      deltaMassa: ultimaJulia?.massaMuscular != null
        ? ultimaJulia.massaMuscular - BASELINE_JULIA.massaMuscular
        : null,
      deltaGordura: ultimaJulia?.gorduraSubcutanea != null
        ? ultimaJulia.gorduraSubcutanea - BASELINE_JULIA.gorduraSubcutanea
        : null,
      historico: medidasJulia,
    },
  }
}

export function criarMedidaJulia(data: {
  data: Date
  peso: number
  massaMuscular?: number
  gorduraSubcutanea?: number
  fonte: string
  notas?: string
}) {
  return prisma.medidaCorporal.create({ data: { ...data, pessoa: "julia" } })
}

export function atualizarMedidaJulia(
  id: number,
  data: {
    data?: Date
    peso?: number
    massaMuscular?: number
    gorduraSubcutanea?: number
    fonte?: string
    notas?: string
  }
) {
  return prisma.medidaCorporal.update({ where: { id }, data })
}

export function deletarMedidaJulia(id: number) {
  return prisma.medidaCorporal.delete({ where: { id } })
}
