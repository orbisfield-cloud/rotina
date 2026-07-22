"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Log {
  id: string
  date: string | Date
  dayType: string
  resistanceAvg: number | null
  executedSomething: boolean | null
  dayLost: boolean | null
  freeNote: string | null
}

function ToggleButton({ value, onTrue, onFalse, labelTrue, labelFalse }: {
  value: boolean | null
  onTrue: () => void
  onFalse: () => void
  labelTrue: string
  labelFalse: string
}) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-border">
      <button
        onClick={onTrue}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${value === true ? "bg-[#10b981] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
      >
        {labelTrue}
      </button>
      <button
        onClick={onFalse}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${value === false ? "bg-[#ef4444] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
      >
        {labelFalse}
      </button>
    </div>
  )
}

export function DailyLogManager() {
  const [logHoje, setLogHoje] = useState<Log | null>(null)
  const [historico, setHistorico] = useState<Log[]>([])
  const [resistencia, setResistencia] = useState<number>(5)
  const [executou, setExecutou] = useState<boolean | null>(null)
  const [perdido, setPerdido] = useState<boolean | null>(null)
  const [nota, setNota] = useState("")
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    const [logRes, histRes] = await Promise.all([
      fetch("/api/daily-log"),
      fetch("/api/daily-log/history"),
    ])
    const log = await logRes.json()
    const hist = await histRes.json()
    setLogHoje(log)
    setHistorico(hist)
    if (log) {
      if (log.resistanceAvg !== null) setResistencia(log.resistanceAvg)
      if (log.executedSomething !== null) setExecutou(log.executedSomething)
      if (log.dayLost !== null) setPerdido(log.dayLost)
      if (log.freeNote) setNota(log.freeNote)
    }
  }

  useEffect(() => { carregar() }, [])

  async function definirTipoDia(dayType: string) {
    const res = await fetch("/api/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayType }),
    })
    const log = await res.json()
    setLogHoje(log)
    carregar()
  }

  async function salvarNoite() {
    if (!logHoje) return
    setSalvando(true)
    await fetch("/api/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: logHoje.id,
        resistanceAvg: resistencia,
        executedSomething: executou,
        dayLost: perdido,
        freeNote: nota || null,
      }),
    })
    toast.success("Log salvo")
    setSalvando(false)
    carregar()
  }

  return (
    <div className="space-y-6">
      {/* definir tipo do dia */}
      {!logHoje ? (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <p className="text-sm font-medium">Como está o dia?</p>
          <div className="flex gap-3">
            <Button onClick={() => definirTipoDia("good")} className="flex-1 bg-[#10b981] hover:bg-[#10b981]/90 text-white">
              ☀️ Dia bom
            </Button>
            <Button onClick={() => definirTipoDia("bad")} className="flex-1 bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white">
              🌧️ Dia ruim
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Log de hoje</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {logHoje.dayType === "good" ? "☀️ Dia bom" : "🌧️ Dia ruim"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Resistência média do dia</Label>
              <span className="text-sm font-semibold tabular">{resistencia}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={resistencia}
              onChange={e => setResistencia(Number(e.target.value))}
              className="w-full accent-[#8b5cf6]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Executei algo novo em projeto?</Label>
            <ToggleButton
              value={executou}
              onTrue={() => setExecutou(true)}
              onFalse={() => setExecutou(false)}
              labelTrue="Sim"
              labelFalse="Não"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Dia perdido?</Label>
            <ToggleButton
              value={perdido}
              onTrue={() => setPerdido(true)}
              onFalse={() => setPerdido(false)}
              labelTrue="Sim"
              labelFalse="Não"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Nota livre</Label>
            <Textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Uma linha sobre o dia..."
              rows={2}
              className="bg-secondary border-border resize-none text-sm"
            />
          </div>

          <Button onClick={salvarNoite} disabled={salvando} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {salvando ? "Salvando..." : "Salvar log da noite"}
          </Button>
        </div>
      )}

      {/* histórico */}
      {historico.length > 0 && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-muted-foreground">Últimos 14 dias</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Data</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Tipo</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Resist.</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Exec.</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Perdido</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{format(new Date(l.date), "dd/MM", { locale: ptBR })}</td>
                    <td className="px-3 py-2">{l.dayType === "good" ? "☀️" : "🌧️"}</td>
                    <td className="px-3 py-2 tabular">{l.resistanceAvg ?? "—"}</td>
                    <td className="px-3 py-2">{l.executedSomething === null ? "—" : l.executedSomething ? "✓" : "✗"}</td>
                    <td className="px-3 py-2">{l.dayLost === null ? "—" : l.dayLost ? "✓" : "✗"}</td>
                    <td className="px-3 py-2 max-w-[140px] truncate text-muted-foreground">{l.freeNote ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
