"use client"

import { useState } from "react"
import Link from "next/link"
import { DayTypeModal } from "./DayTypeModal"
import { toast } from "sonner"
import { Circle, ChevronRight, ChevronDown, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Sistema {
  id: string
  name: string
  icon: string | null
  color: string | null
  _count: { tasks: number }
}

interface Tarefa {
  id: string
  title: string
  effort: string
  dueDate: Date | null
  nextSessionNote: string | null
  consequenceChain: string | null
  system: { name: string; color: string | null; icon: string | null }
  folder?: { name: string } | null
}

interface LogHoje {
  id: string
  dayType: string
}

interface ResumoSemanal {
  diasBons: number
  diasRuins: number
  diasPerdidos: number
  resistenciaMedia: number | null
  totalLogs: number
}

interface Props {
  logHoje: LogHoje | null
  sistemas: Sistema[]
  tarefas: Tarefa[]
  entradas: Tarefa[]
  atrasadas: Tarefa[]
  streak: number
  resumoSemanal: ResumoSemanal
}

export function HomeACP({ logHoje, sistemas, tarefas, entradas, atrasadas, streak, resumoSemanal }: Props) {
  const [dayType, setDayType] = useState<string | null>(logHoje?.dayType ?? null)
  const [logId, setLogId] = useState<string | null>(logHoje?.id ?? null)
  const [feitas, setFeitas] = useState<Set<string>>(new Set())
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set())

  async function handleDayType(tipo: "good" | "bad") {
    const res = await fetch("/api/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayType: tipo }),
    })
    const log = await res.json()
    setDayType(tipo)
    setLogId(log.id)
  }

  async function marcarFeita(id: string) {
    setFeitas((prev) => new Set(prev).add(id))
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    })
    toast.success("Tarefa concluída")
  }

  function toggleExpand(id: string) {
    setExpandidas(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (!dayType) return <DayTypeModal onSelect={handleDayType} />

  const esforcos = dayType === "good" ? ["high", "any"] : ["low", "any"]
  const tarefasDoDia = tarefas.filter((t) => esforcos.includes(t.effort) && !feitas.has(t.id))
  const reentradas = entradas.filter((t) => t.nextSessionNote && !feitas.has(t.id) && esforcos.includes(t.effort))
  const atrasadasVisiveis = atrasadas.filter(t => !feitas.has(t.id))

  const labelDia = dayType === "good" ? "☀️ Dia bom" : "🌧️ Dia ruim"

  function diasAtraso(dueDate: Date | null): number {
    if (!dueDate) return 0
    const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const hoje = new Date(Date.UTC(brasilia.getUTCFullYear(), brasilia.getUTCMonth(), brasilia.getUTCDate()))
    const due = new Date(String(dueDate).slice(0, 10) + "T12:00:00.000Z")
    return Math.floor((hoje.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          {streak > 0 && (
            <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-medium">
              🔥 {streak} {streak === 1 ? "dia" : "dias"}
            </span>
          )}
        </div>
        <button
          onClick={() => setDayType(null)}
          title="Clique para alterar o tipo do dia"
          className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full hover:bg-secondary/80 transition-colors"
        >
          {labelDia}
        </button>
      </div>

      {/* resumo semanal */}
      {resumoSemanal.totalLogs > 0 && (
        <div className="rounded-xl bg-card border border-border px-4 py-3 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-medium text-foreground">Esta semana</span>
          <span>☀️ {resumoSemanal.diasBons} bons</span>
          <span>🌧️ {resumoSemanal.diasRuins} ruins</span>
          {resumoSemanal.resistenciaMedia !== null && (
            <span>Resist. média: {resumoSemanal.resistenciaMedia}/10</span>
          )}
          {resumoSemanal.diasPerdidos > 0 && (
            <span className="text-[#ef4444]">{resumoSemanal.diasPerdidos} perdidos</span>
          )}
        </div>
      )}

      {/* atrasadas */}
      {atrasadasVisiveis.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#ef4444] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Atrasadas
          </p>
          <div className="space-y-1.5">
            {atrasadasVisiveis.map((t) => {
              const atraso = diasAtraso(t.dueDate)
              return (
                <div key={t.id} className="rounded-xl bg-card border border-[#ef4444]/30 overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => marcarFeita(t.id)}
                      className="shrink-0 text-[#ef4444]/60 hover:text-[#10b981] transition-colors"
                    >
                      <Circle size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        <span style={{ color: t.system.color ?? "#94a3b8" }}>
                          {t.system.icon} {t.system.name}
                        </span>
                        <span className="text-[#ef4444] ml-1">
                          · {atraso === 1 ? "1 dia atraso" : `${atraso} dias atraso`}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* sistemas */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Sistemas</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sistemas.map((s) => (
            <Link
              key={s.id}
              href={`/systems/${s.id}`}
              className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-[#252932] transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{s.icon}</span>
                <span className="text-sm font-medium truncate">{s.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {s._count.tasks > 0 && (
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${s.color}22`, color: s.color ?? "#94a3b8" }}
                  >
                    {s._count.tasks}
                  </span>
                )}
                <ChevronRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* reentradas */}
      {reentradas.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Reentradas <span className="normal-case font-normal">— começa por...</span>
          </p>
          <div className="space-y-2">
            {reentradas.map((t) => (
              <div key={t.id} className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="flex items-start gap-2 p-3">
                  <button onClick={() => marcarFeita(t.id)} className="mt-0.5 shrink-0 text-muted-foreground hover:text-[#10b981] transition-colors">
                    <Circle size={15} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{t.title}</p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: t.system.color ?? "#94a3b8" }}>
                      {t.system.icon} {t.system.name}
                    </p>
                  </div>
                </div>
                <div className="px-3 pb-3 ml-5 space-y-2">
                  <div className="rounded-lg bg-secondary/60 px-3 py-2 text-xs">{t.nextSessionNote}</div>
                  {t.consequenceChain && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cadeia de consequências</p>
                      <div className="rounded-lg bg-secondary/40 px-2.5 py-1.5 text-xs whitespace-pre-wrap">{t.consequenceChain}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* tarefas do dia */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Tarefas de hoje
        </p>
        {tarefasDoDia.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem tarefas pendentes para o tipo de dia de hoje.</p>
        ) : (
          <div className="space-y-1.5">
            {tarefasDoDia.map((t) => {
              const expandida = expandidas.has(t.id)
              const temDetalhes = !!(t.nextSessionNote || t.consequenceChain)
              return (
                <div key={t.id} className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => marcarFeita(t.id)}
                      className="shrink-0 text-muted-foreground hover:text-[#10b981] transition-colors"
                    >
                      <Circle size={16} />
                    </button>
                    <div
                      className={`flex-1 min-w-0 ${temDetalhes ? "cursor-pointer select-none" : ""}`}
                      onClick={() => temDetalhes && toggleExpand(t.id)}
                    >
                      <p className="text-sm">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        <span style={{ color: t.system.color ?? "#94a3b8" }}>
                          {t.system.icon} {t.system.name}
                        </span>
                        {t.folder ? ` · ${t.folder.name}` : ""}
                        {t.dueDate ? ` · vence ${format(new Date(t.dueDate), "dd/MM", { locale: ptBR })}` : ""}
                      </p>
                    </div>
                    {temDetalhes && (
                      <ChevronDown
                        size={13}
                        className={`text-muted-foreground transition-transform duration-200 shrink-0 ${expandida ? "rotate-180" : ""}`}
                        onClick={() => toggleExpand(t.id)}
                      />
                    )}
                  </div>
                  {expandida && temDetalhes && (
                    <div className="px-3 pb-3 ml-9 space-y-2">
                      {t.nextSessionNote && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Próxima sessão</p>
                          <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5 text-xs">{t.nextSessionNote}</div>
                        </div>
                      )}
                      {t.consequenceChain && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cadeia de consequências</p>
                          <div className="rounded-lg bg-secondary/60 px-2.5 py-1.5 text-xs whitespace-pre-wrap">{t.consequenceChain}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
