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

export async function tarefasAtrasadas() {
  const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const hoje = new Date(Date.UTC(brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate()))
  return prisma.task.findMany({
    where: { done: false, dueDate: { lt: hoje } },
    include: {
      system: { select: { name: true, color: true, icon: true } },
      folder: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
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
  recurrence?: string | null
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
      recurrence: data.recurrence || null,
    },
  })
}

function proximaDataRecorrente(dueDate: Date | null, recurrence: string): Date {
  const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const base = dueDate
    ? new Date(dueDate)
    : new Date(Date.UTC(brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate()))
  switch (recurrence) {
    case "daily":
      return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + 1))
    case "weekly":
      return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + 7))
    case "monthly":
      return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate()))
    default:
      return base
  }
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
    recurrence: string | null
    done: boolean
  }>
) {
  const { dueDate, done, ...rest } = data
  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(done === true ? { done: true, doneAt: new Date() } : {}),
      ...(done === false ? { done: false, doneAt: null } : {}),
    },
  })

  // Ao concluir uma tarefa recorrente, cria a próxima ocorrência
  if (done === true && updated.recurrence) {
    await prisma.task.create({
      data: {
        title: updated.title,
        description: updated.description,
        systemId: updated.systemId,
        folderId: updated.folderId,
        effort: updated.effort,
        dueDate: proximaDataRecorrente(updated.dueDate, updated.recurrence),
        nextSessionNote: updated.nextSessionNote,
        consequenceChain: updated.consequenceChain,
        recurrence: updated.recurrence,
      },
    })
  }

  return updated
}

export async function deletarTarefa(id: string) {
  return prisma.task.delete({ where: { id } })
}
