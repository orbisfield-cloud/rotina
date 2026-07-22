export const dynamic = "force-dynamic"

import { logDeHoje, calcularStreak, resumoSemanal } from "@/lib/db/daily-log"
import { listarSistemas } from "@/lib/db/systems"
import { tarefasHoje, reentradas, tarefasAtrasadas } from "@/lib/db/tasks"
import { HomeACP } from "@/components/home/HomeACP"

export default async function DashboardPage() {
  const [logHoje, sistemas, todasTarefas, entradas, atrasadas, streak, semanal] = await Promise.all([
    logDeHoje(),
    listarSistemas(),
    tarefasHoje("good"),
    reentradas(),
    tarefasAtrasadas(),
    calcularStreak(),
    resumoSemanal(),
  ])

  const tarefasBad = await tarefasHoje("bad")
  const tarefasMerge = [
    ...todasTarefas,
    ...tarefasBad.filter(t => !todasTarefas.find(x => x.id === t.id)),
  ]

  return (
    <HomeACP
      logHoje={logHoje ? { id: logHoje.id, dayType: logHoje.dayType } : null}
      sistemas={sistemas}
      tarefas={tarefasMerge}
      entradas={entradas}
      atrasadas={atrasadas}
      streak={streak}
      resumoSemanal={semanal}
    />
  )
}
