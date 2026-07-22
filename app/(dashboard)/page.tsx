export const dynamic = "force-dynamic"

import { logDeHoje } from "@/lib/db/daily-log"
import { listarSistemas } from "@/lib/db/systems"
import { tarefasHoje, reentradas } from "@/lib/db/tasks"
import { HomeACP } from "@/components/home/HomeACP"

export default async function DashboardPage() {
  const [logHoje, sistemas, todasTarefas, entradas] = await Promise.all([
    logDeHoje(),
    listarSistemas(),
    tarefasHoje("good"), // passa todas as high+any; o cliente filtra
    reentradas(),
  ])

  // Busca também as low+any para o cliente ter as duas listas
  const tarefasBad = await tarefasHoje("bad")

  // Merge deduplicado — o cliente vai filtrar pelo dayType real
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
    />
  )
}
