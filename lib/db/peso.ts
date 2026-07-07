import { prisma } from "@/lib/db"

export function listarMedidas(pessoa = "filipe") {
  return prisma.medidaCorporal.findMany({
    where: { pessoa },
    orderBy: { data: "desc" },
  })
}

export function buscarMedida(id: number) {
  return prisma.medidaCorporal.findUnique({ where: { id } })
}

export function criarMedida(data: {
  data: Date
  peso: number
  massaMuscular?: number
  gorduraSubcutanea?: number
  fonte: string
  notas?: string
  pessoa?: string
}) {
  return prisma.medidaCorporal.create({ data })
}

export function atualizarMedida(
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

export function deletarMedida(id: number) {
  return prisma.medidaCorporal.delete({ where: { id } })
}

export async function pesoAtual() {
  return prisma.medidaCorporal.findFirst({
    where: { pessoa: "filipe" },
    orderBy: { data: "desc" },
  })
}

export async function historicoPeso(diasAtras = 60) {
  const desde = new Date()
  desde.setDate(desde.getDate() - diasAtras)

  return prisma.medidaCorporal.findMany({
    where: { pessoa: "filipe", data: { gte: desde } },
    orderBy: { data: "asc" },
    select: { data: true, peso: true, massaMuscular: true, gorduraSubcutanea: true },
  })
}
