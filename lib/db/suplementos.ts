import { prisma } from "@/lib/db"

export function listarSuplementos(apenasAtivos = false) {
  return prisma.suplemento.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: [{ horario: "asc" }, { nome: "asc" }],
  })
}

export function buscarSuplemento(id: number) {
  return prisma.suplemento.findUnique({ where: { id } })
}

export function criarSuplemento(data: {
  nome: string
  dose: string
  horario: string
  notas?: string
}) {
  return prisma.suplemento.create({ data })
}

export function atualizarSuplemento(
  id: number,
  data: { nome?: string; dose?: string; horario?: string; notas?: string; ativo?: boolean }
) {
  return prisma.suplemento.update({ where: { id }, data })
}

export function deletarSuplemento(id: number) {
  return prisma.suplemento.delete({ where: { id } })
}

export async function listarRegistrosDoDia(data: Date) {
  const suplementosAtivos = await prisma.suplemento.findMany({
    where: { ativo: true },
    orderBy: [{ horario: "asc" }, { nome: "asc" }],
  })

  const registros = await prisma.registroSuplemento.findMany({
    where: { data },
  })

  const registrosPorSuplemento = new Map(registros.map((r) => [r.suplementoId, r]))

  return suplementosAtivos.map((s) => ({
    ...s,
    registro: registrosPorSuplemento.get(s.id) ?? null,
  }))
}

export async function toggleRegistro(suplementoId: number, data: Date, tomado: boolean) {
  return prisma.registroSuplemento.upsert({
    where: { suplementoId_data: { suplementoId, data } },
    update: { tomado },
    create: { suplementoId, data, tomado },
  })
}

export async function aderenciaSemana(diasAtras: number) {
  const hoje = new Date()
  const inicio = new Date(hoje)
  inicio.setDate(inicio.getDate() - diasAtras)

  const registros = await prisma.registroSuplemento.findMany({
    where: { data: { gte: inicio } },
    orderBy: { data: "asc" },
  })

  const totalAtivos = await prisma.suplemento.count({ where: { ativo: true } })

  const porDia = new Map<string, { tomados: number; total: number }>()
  registros.forEach((r) => {
    const dia = r.data.toISOString().split("T")[0]
    const atual = porDia.get(dia) ?? { tomados: 0, total: totalAtivos }
    porDia.set(dia, { ...atual, tomados: atual.tomados + (r.tomado ? 1 : 0) })
  })

  return Array.from(porDia.entries()).map(([data, v]) => ({ data, ...v }))
}

export async function resumoHoje() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const registros = await prisma.registroSuplemento.findMany({
    where: { data: hoje },
  })

  const totalAtivos = await prisma.suplemento.count({ where: { ativo: true } })
  const tomados = registros.filter((r) => r.tomado).length

  return { tomados, total: totalAtivos }
}
