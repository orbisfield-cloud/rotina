import { prisma } from "@/lib/db"

export async function tarefasHoje(dayType: string) {
  const esforcos = dayType === "good" ? ["high", "any"] : ["low", "any"]
  return prisma.task.findMany({
    where: { done: false, effort: { in: esforcos } },
    include: {
      system: { select: { name: true, color: true, icon: true } },
      folder: { select: { name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })
}

export async function reentradas() {
  return prisma.task.findMany({
    where: { done: false, nextSessionNote: { not: null } },
    include: { system: { select: { name: true, color: true, icon: true } } },
    orderBy: { updatedAt: "desc" },
  })
}

export async function criarTarefa(data: {
  title: string
  description?: string | null
  systemId: string
  folderId?: string | null
  effort?: string
  dueDate?: string | null
  nextSessionNote?: string | null
  consequenceChain?: string | null
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      systemId: data.systemId,
      folderId: data.folderId || null,
      effort: data.effort || "high",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      nextSessionNote: data.nextSessionNote || null,
      consequenceChain: data.consequenceChain || null,
    },
  })
}

export async function atualizarTarefa(
  id: string,
  data: Partial<{
    title: string
    description: string | null
    folderId: string | null
    effort: string
    dueDate: string | null
    nextSessionNote: string | null
    consequenceChain: string | null
    done: boolean
  }>
) {
  const { dueDate, done, ...rest } = data
  return prisma.task.update({
    where: { id },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(done === true ? { done: true, doneAt: new Date() } : {}),
      ...(done === false ? { done: false, doneAt: null } : {}),
    },
  })
}

export async function deletarTarefa(id: string) {
  return prisma.task.delete({ where: { id } })
}
