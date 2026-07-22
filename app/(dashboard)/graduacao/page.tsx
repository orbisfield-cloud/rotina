export const dynamic = "force-dynamic"

import { listarSemestres, semestreAtivo } from "@/lib/db/graduation"
import { GraduacaoView } from "@/components/graduation/GraduacaoView"

export default async function GraduacaoPage() {
  const [semestres, ativo] = await Promise.all([listarSemestres(), semestreAtivo()])
  return (
    <GraduacaoView
      initialSemestres={semestres}
      initialSemestreAtivo={ativo as Parameters<typeof GraduacaoView>[0]["initialSemestreAtivo"]}
    />
  )
}
