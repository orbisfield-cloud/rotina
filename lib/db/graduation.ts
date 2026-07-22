import { prisma } from "@/lib/db"

const PALETA = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899",
  "#06B6D4", "#F97316", "#6366F1", "#14B8A6", "#E11D48", "#84CC16",
]

export async function listarSemestres() {
  return prisma.semester.findMany({ orderBy: { createdAt: "desc" } })
}

export async function semestreAtivo() {
  return prisma.semester.findFirst({
    where: { active: true },
    include: {
      disciplines: {
        orderBy: { createdAt: "asc" },
        include: {
          grades: { orderBy: { createdAt: "asc" } },
          schedules: { orderBy: { dayOfWeek: "asc" } },
        },
      },
    },
  })
}

export async function criarSemestre(name: string) {
  const count = await prisma.semester.count()
  if (count === 0) {
    return prisma.semester.create({ data: { name, active: true } })
  }
  return prisma.semester.create({ data: { name, active: false } })
}

export async function ativarSemestre(id: string) {
  await prisma.semester.updateMany({ data: { active: false } })
  return prisma.semester.update({ where: { id }, data: { active: true } })
}

export async function criarDisciplina(data: {
  name: string
  code?: string | null
  semesterId: string
  totalClasses: number
}) {
  const existentes = await prisma.discipline.findMany({ where: { semesterId: data.semesterId } })
  const coresUsadas = existentes.map(d => d.color)
  const cor = PALETA.find(c => !coresUsadas.includes(c)) ?? PALETA[existentes.length % PALETA.length]
  return prisma.discipline.create({ data: { ...data, color: cor } })
}

export async function obterDisciplina(id: string) {
  return prisma.discipline.findUnique({
    where: { id },
    include: {
      grades: { orderBy: { createdAt: "asc" } },
      schedules: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      semester: true,
    },
  })
}

export async function atualizarDisciplina(
  id: string,
  data: Partial<{ name: string; code: string | null; totalClasses: number; gradeFormula: string | null; status: string }>
) {
  return prisma.discipline.update({ where: { id }, data })
}

export async function deletarDisciplina(id: string) {
  return prisma.discipline.delete({ where: { id } })
}

export async function atualizarFaltas(id: string, delta: number) {
  const d = await prisma.discipline.findUnique({ where: { id } })
  if (!d) throw new Error("Disciplina não encontrada")
  const novas = Math.max(0, d.currentAbsences + delta)
  return prisma.discipline.update({ where: { id }, data: { currentAbsences: novas } })
}

export async function criarNota(data: { name: string; weight: number; disciplineId: string }) {
  return prisma.grade.create({ data })
}

export async function atualizarNota(
  id: string,
  data: Partial<{ name: string; value: number | null; weight: number }>
) {
  return prisma.grade.update({ where: { id }, data })
}

export async function deletarNota(id: string) {
  return prisma.grade.delete({ where: { id } })
}

export async function criarHorario(data: {
  disciplineId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}) {
  return prisma.schedule.create({ data })
}

export async function deletarHorario(id: string) {
  return prisma.schedule.delete({ where: { id } })
}
