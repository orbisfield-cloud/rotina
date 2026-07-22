export const dynamic = "force-dynamic"

import { semestreAtivo } from "@/lib/db/graduation"
import { GradeHoraria } from "@/components/graduation/GradeHoraria"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function GradeHorariaPage() {
  const semestre = await semestreAtivo()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/graduacao"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} /> Graduação
        </Link>
        <h1 className="text-xl font-semibold">Grade Horária</h1>
        <span className="text-xs text-muted-foreground">{semestre?.name ?? ""}</span>
      </div>

      {!semestre || semestre.disciplines.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma disciplina com horários cadastrados.</p>
      ) : (
        <GradeHoraria disciplinas={semestre.disciplines} />
      )}
    </div>
  )
}
