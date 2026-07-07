import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy } from "lucide-react"

interface DesafioCardProps {
  diasRestantes: number
  diasTotais: number
  deltaMassa: number | null
  deltaGordura: number | null
}

export function DesafioCard({ diasRestantes, diasTotais, deltaMassa, deltaGordura }: DesafioCardProps) {
  const progresso = Math.round(((diasTotais - diasRestantes) / diasTotais) * 100)

  return (
    <Card className="bg-card border-border col-span-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">Desafio — vs Julia</CardTitle>
        <Trophy size={16} className="text-[#f59e0b]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold tabular text-[#f59e0b]">{diasRestantes}</span>
          <span className="text-sm text-muted-foreground">dias restantes</span>
        </div>
        <Progress value={progresso} className="h-2" />
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Massa </span>
            <span className={deltaMassa != null ? (deltaMassa > 0 ? "text-[#10b981]" : "text-[#ef4444]") : "text-muted-foreground"}>
              {deltaMassa != null ? `${deltaMassa > 0 ? "+" : ""}${deltaMassa.toFixed(1)}kg` : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Gordura </span>
            <span className={deltaGordura != null ? (deltaGordura < 0 ? "text-[#10b981]" : "text-[#ef4444]") : "text-muted-foreground"}>
              {deltaGordura != null ? `${deltaGordura > 0 ? "+" : ""}${deltaGordura.toFixed(1)}%` : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
