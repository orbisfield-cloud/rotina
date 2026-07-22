"use client"

import { useState } from "react"
import Link from "next/link"
import { DayTypeModal } from "./DayTypeModal"
import { toast } from "sonner"
import { Circle, ChevronRight, ChevronDown } from "lucide-react"
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

interface Props {
  logHoje: LogHoje | null
  sistemas: Sistema[]
  tarefas: Tarefa[]
  entradas: Tarefa[]
}

export function HomeACP({ logHoje, sistemas, tarefas, entradas }: Props) {
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
  const reentradas = entradas.filter((t) => t.nextSessionNote && !feitas.has(t.id))

  const labelDia = dayType === "good" ? "☀️ Dia bom" : "🌧️ Dia ruim"

  return (
    <div className="space-y-6">
      {/* status do dia */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={() => setDayType(null)}
          title="Clique para alterar o tipo do dia"
          className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full hover:bg-secondary/80 transition-colors"
        >
          {labelDia}
        </button>
      </div>

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
                    <p
                      className="text-xs mt-0.5 font-medium"
                      style={{ color: t.system.color ?? "#94a3b8" }}
                    >
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
