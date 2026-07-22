export const dynamic = "force-dynamic"

import { obterDisciplina } from "@/lib/db/graduation"
import { DisciplinaDetail } from "@/components/graduation/DisciplinaDetail"
import { notFound } from "next/navigation"

export default async function DisciplinaPage({ params }: { params: Promise<{ disciplineId: string }> }) {
  const { disciplineId } = await params
  const disciplina = await obterDisciplina(disciplineId)
  if (!disciplina) return notFound()
  return <DisciplinaDetail inicial={disciplina as Parameters<typeof DisciplinaDetail>[0]["inicial"]} />
}
