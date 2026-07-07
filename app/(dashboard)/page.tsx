export const dynamic = "force-dynamic"

import { resumoHoje, aderenciaSemana } from "@/lib/db/suplementos"
import { ultimoTreino, resumoSemanal } from "@/lib/db/treino"
import { pesoAtual, historicoPeso } from "@/lib/db/peso"
import { dadosDesafio } from "@/lib/db/desafio"
import { StatCard } from "@/components/dashboard/StatCard"
import { PesoGraficoDashboard } from "@/components/dashboard/PesoGraficoDashboard"
import { AderenciaGrafico } from "@/components/dashboard/AderenciaGrafico"
import { DesafioCard } from "@/components/dashboard/DesafioCard"
import { Pill, Dumbbell, Scale } from "lucide-react"
import { differenceInDays } from "date-fns"

export default async function DashboardPage() {
  const [suplementosHoje, aderencia, ultimo, semanal, peso, historico, desafio] = await Promise.all([
    resumoHoje(),
    aderenciaSemana(14),
    ultimoTreino(),
    resumoSemanal(),
    pesoAtual(),
    historicoPeso(60),
    dadosDesafio(),
  ])

  const diasDesdeUltimoTreino = ultimo
    ? differenceInDays(new Date(), new Date(ultimo.data))
    : null

  const pesoInicio = historico[0]?.peso
  const deltaPeso = peso && pesoInicio ? peso.peso - pesoInicio : null

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <DesafioCard
        diasRestantes={desafio.diasRestantes}
        diasTotais={desafio.diasTotais}
        deltaMassa={desafio.filipe.deltaMassa}
        deltaGordura={desafio.filipe.deltaGordura}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Suplementos hoje"
          value={`${suplementosHoje.tomados}/${suplementosHoje.total}`}
          sub="tomados hoje"
          icon={Pill}
          accent={suplementosHoje.tomados === suplementosHoje.total && suplementosHoje.total > 0 ? "green" : "default"}
        />
        <StatCard
          title="Último treino"
          value={diasDesdeUltimoTreino === null ? "—" : diasDesdeUltimoTreino === 0 ? "hoje" : diasDesdeUltimoTreino === 1 ? "ontem" : `${diasDesdeUltimoTreino}d`}
          sub={ultimo ? `${ultimo.tipo} · ${ultimo.duracao}min` : "Sem registro"}
          icon={Dumbbell}
          accent={diasDesdeUltimoTreino !== null && diasDesdeUltimoTreino <= 2 ? "green" : diasDesdeUltimoTreino !== null && diasDesdeUltimoTreino > 5 ? "red" : "default"}
        />
        <StatCard
          title="Peso atual"
          value={peso ? `${peso.peso}kg` : "—"}
          sub={deltaPeso !== null ? `${deltaPeso > 0 ? "+" : ""}${deltaPeso.toFixed(1)}kg desde o início` : "Sem histórico"}
          icon={Scale}
          accent="default"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PesoGraficoDashboard dados={historico} />
        <AderenciaGrafico dados={aderencia} />
      </div>
    </div>
  )
}
