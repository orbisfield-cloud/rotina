import { prisma } from "@/lib/db"

export function listarTreinos(limite = 30) {
  return prisma.treino.findMany({
    orderBy: { data: "desc" },
    take: limite,
  })
}

export function buscarTreino(id: number) {
  return prisma.treino.findUnique({ where: { id } })
}

export function criarTreino(data: {
  data: Date
  tipo: string
  duracao: number
  intensidade?: number
  notas?: string
}) {
  return prisma.treino.create({ data })
}

export function atualizarTreino(
  id: number,
  data: { data?: Date; tipo?: string; duracao?: number; intensidade?: number; notas?: string }
) {
  return prisma.treino.update({ where: { id }, data })
}

export function deletarTreino(id: number) {
  return prisma.treino.delete({ where: { id } })
}

export async function resumoSemanal() {
  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(inicioSemana.getDate() - 7)

  const treinos = await prisma.treino.findMany({
    where: { data: { gte: inicioSemana } },
  })

  return {
    musculacao: treinos.filter((t) => t.tipo === "musculacao").length,
    futebol: treinos.filter((t) => t.tipo === "futebol").length,
    outro: treinos.filter((t) => t.tipo === "outro").length,
    total: treinos.length,
  }
}

export async function ultimoTreino() {
  return prisma.treino.findFirst({ orderBy: { data: "desc" } })
}
