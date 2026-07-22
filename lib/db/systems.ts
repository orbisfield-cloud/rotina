import { prisma } from "@/lib/db"

const SISTEMAS_PADRAO = [
  { name: "TDAH",       icon: "⚡", color: "#8B5CF6", order: 0, isDefault: true },
  { name: "Graduação",  icon: "🎓", color: "#3B82F6", order: 1, isDefault: true },
  { name: "República",  icon: "🏠", color: "#10B981", order: 2, isDefault: true },
  { name: "gMAP",       icon: "🗺️", color: "#F59E0B", order: 3, isDefault: true },
  { name: "Financeiro", icon: "💰", color: "#059669", order: 4, isDefault: true },
  { name: "Pessoal",    icon: "🙋", color: "#EC4899", order: 5, isDefault: true },
]

export async function listarSistemas() {
  const count = await prisma.system.count()
  if (count === 0) {
    await prisma.system.createMany({ data: SISTEMAS_PADRAO })
  }
  return prisma.system.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { tasks: { where: { done: false } } } } },
  })
}

export async function obterSistema(id: string) {
  return prisma.system.findUnique({
    where: { id },
    include: {
      folders: {
        orderBy: { order: "asc" },
        include: { tasks: { where: { done: false }, orderBy: { createdAt: "desc" } } },
      },
      tasks: { where: { done: false, folderId: null }, orderBy: { createdAt: "desc" } },
    },
  })
}

export async function criarSistema(data: { name: string; icon?: string; color?: string }) {
  const count = await prisma.system.count()
  return prisma.system.create({ data: { ...data, order: count } })
}

export async function atualizarSistema(
  id: string,
  data: Partial<{ name: string; icon: string; color: string; order: number }>
) {
  return prisma.system.update({ where: { id }, data })
}

export async function deletarSistema(id: string) {
  const s = await prisma.system.findUnique({ where: { id } })
  if (s?.isDefault) throw new Error("Sistemas padrão não podem ser deletados")
  return prisma.system.delete({ where: { id } })
}

export async function criarPasta(data: { name: string; systemId: string }) {
  const count = await prisma.folder.count({ where: { systemId: data.systemId } })
  return prisma.folder.create({ data: { ...data, order: count } })
}

export async function atualizarPasta(id: string, data: { name: string }) {
  return prisma.folder.update({ where: { id }, data })
}

export async function deletarPasta(id: string) {
  await prisma.task.updateMany({ where: { folderId: id }, data: { folderId: null } })
  return prisma.folder.delete({ where: { id } })
}
