"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Pencil, Minus } from "lucide-react"
import { toast } from "sonner"
import { evaluate } from "mathjs"
import {
  calcularMedia, maxFaltas, corBarraFaltas,
  STATUS_LABELS, STATUS_COLORS, DIAS_SEMANA,
} from "@/lib/graduation-utils"

interface Nota { id: string; name: string; value: number | null; weight: number }
interface Horario { id: string; dayOfWeek: number; startTime: string; endTime: string }
interface Disciplina {
  id: string; name: string; code: string | null; color: string
  totalClasses: number; currentAbsences: number; gradeFormula: string | null
  status: string; grades: Nota[]; schedules: Horario[]
  semester: { name: string }
}

// ── Formula calculator ──────────────────────────────────────────────────────

function CalculadoraFormula({
  grades,
  value,
  onChange,
}: {
  grades: Nota[]
  value: string
  onChange: (v: string) => void
}) {
  const preview = useMemo(() => {
    if (!value.trim()) return null
    const scope: Record<string, number> = {}
    for (const g of grades) {
      if (g.value !== null) scope[g.name] = g.value
    }
    try {
      const result = evaluate(value.trim(), scope)
      const n = Number(result)
      return isFinite(n) ? `${n.toFixed(2)}` : "Inválida"
    } catch {
      return "Pendente ou inválida"
    }
  }, [value, grades])

  function append(s: string) { onChange(value + s) }

  const btnCls = "px-2 py-1 text-xs rounded-lg font-mono transition-colors"

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="ex: (P1*2 + P2*3)/5"
        className="bg-secondary border-border font-mono text-sm"
      />
      <div className="flex flex-wrap gap-1.5">
        {grades.map(g => (
          <button
            key={g.id}
            type="button"
            onClick={() => append(g.name)}
            className={`${btnCls} bg-[#3B82F6]/15 text-[#3B82F6] hover:bg-[#3B82F6]/30`}
          >
            {g.name}
          </button>
        ))}
        {["+", "-", "*", "/", "(", ")"].map(op => (
          <button
            key={op}
            type="button"
            onClick={() => append(op)}
            className={`${btnCls} bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80`}
          >
            {op}
          </button>
        ))}
        {["1","2","3","4","5","6","7","8","9","0","."].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => append(n)}
            className={`${btnCls} bg-secondary text-muted-foreground hover:text-foreground`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(value.slice(0, -1))}
          className={`${btnCls} bg-secondary text-muted-foreground hover:text-foreground`}
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => onChange("")}
          className={`${btnCls} bg-secondary text-muted-foreground hover:text-destructive`}
        >
          ✕
        </button>
      </div>
      {preview && (
        <p className="text-xs text-muted-foreground">
          Resultado atual: <span className="text-foreground font-semibold">{preview}</span>
        </p>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function DisciplinaDetail({ inicial }: { inicial: Disciplina }) {
  const [disc, setDisc] = useState(inicial)
  const [editInfoOpen, setEditInfoOpen] = useState(false)
  const [infoForm, setInfoForm] = useState({ name: inicial.name, code: inicial.code ?? "", totalClasses: String(inicial.totalClasses) })
  const [editingNotaId, setEditingNotaId] = useState<string | null>(null)
  const [notaForm, setNotaForm] = useState({ name: "", weight: "", value: "" })
  const [novaNotaForm, setNovaNotaForm] = useState({ name: "", weight: "1" })
  const [adicionandoNota, setAdicionandoNota] = useState(false)
  const [formula, setFormula] = useState(inicial.gradeFormula ?? "")
  const [horarioForm, setHorarioForm] = useState({ dayOfWeek: "1", startTime: "08:00", endTime: "10:00" })
  const [adicionandoHorario, setAdicionandoHorario] = useState(false)

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/graduation/disciplinas/${disc.id}`)
    setDisc(await res.json())
  }, [disc.id])

  const maxF = maxFaltas(disc.totalClasses)
  const pctF = maxF > 0 ? disc.currentAbsences / maxF : 0
  const corBarra = corBarraFaltas(disc.currentAbsences, maxF)
  const faltasRestantes = Math.max(0, maxF - disc.currentAbsences)
  const media = calcularMedia(disc.grades, disc.gradeFormula)

  // ── Discipline info ─────────────────────────────────────────────────────

  async function salvarInfo() {
    if (!infoForm.name.trim() || !infoForm.totalClasses) { toast.error("Campos obrigatórios"); return }
    await fetch(`/api/graduation/disciplinas/${disc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: infoForm.name.trim(),
        code: infoForm.code.trim() || null,
        totalClasses: Number(infoForm.totalClasses),
      }),
    })
    toast.success("Informações atualizadas")
    setEditInfoOpen(false)
    carregar()
  }

  async function mudarStatus(status: string) {
    await fetch(`/api/graduation/disciplinas/${disc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    carregar()
  }

  async function deletarDisciplina() {
    if (!confirm("Excluir disciplina e todos os dados?")) return
    await fetch(`/api/graduation/disciplinas/${disc.id}`, { method: "DELETE" })
    toast.success("Disciplina excluída")
    window.location.href = "/graduacao"
  }

  // ── Faltas ──────────────────────────────────────────────────────────────

  async function atualizarFaltas(delta: number) {
    await fetch(`/api/graduation/disciplinas/${disc.id}/faltas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    })
    carregar()
  }

  // ── Notas ───────────────────────────────────────────────────────────────

  function startEditNota(n: Nota) {
    setEditingNotaId(n.id)
    setNotaForm({ name: n.name, weight: String(n.weight), value: n.value !== null ? String(n.value) : "" })
  }

  async function salvarNota() {
    if (!editingNotaId) return
    const valueNum = notaForm.value !== "" ? Number(notaForm.value) : null
    await fetch(`/api/graduation/notas/${editingNotaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: notaForm.name, weight: Number(notaForm.weight), value: valueNum }),
    })
    setEditingNotaId(null)
    carregar()
  }

  async function adicionarNota() {
    if (!novaNotaForm.name.trim()) { toast.error("Nome obrigatório"); return }
    await fetch("/api/graduation/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: novaNotaForm.name.trim(), weight: Number(novaNotaForm.weight), disciplineId: disc.id }),
    })
    setNovaNotaForm({ name: "", weight: "1" })
    setAdicionandoNota(false)
    carregar()
  }

  async function excluirNota(id: string) {
    await fetch(`/api/graduation/notas/${id}`, { method: "DELETE" })
    carregar()
  }

  // ── Fórmula ─────────────────────────────────────────────────────────────

  async function salvarFormula() {
    await fetch(`/api/graduation/disciplinas/${disc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gradeFormula: formula.trim() || null }),
    })
    toast.success("Fórmula salva")
    carregar()
  }

  // ── Horários ────────────────────────────────────────────────────────────

  async function adicionarHorario() {
    await fetch("/api/graduation/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disciplineId: disc.id,
        dayOfWeek: Number(horarioForm.dayOfWeek),
        startTime: horarioForm.startTime,
        endTime: horarioForm.endTime,
      }),
    })
    setAdicionandoHorario(false)
    carregar()
  }

  async function excluirHorario(id: string) {
    await fetch(`/api/graduation/horarios/${id}`, { method: "DELETE" })
    carregar()
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* back */}
      <Link
        href="/graduacao"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} /> Graduação
      </Link>

      {/* header */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: disc.color }} />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight">{disc.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {disc.code ? `${disc.code} · ` : ""}{disc.semester.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => { setInfoForm({ name: disc.name, code: disc.code ?? "", totalClasses: String(disc.totalClasses) }); setEditInfoOpen(true) }}>
              <Pencil size={13} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={deletarDisciplina}>
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Status:</p>
          <Select value={disc.status} onValueChange={v => v && mudarStatus(v)}>
            <SelectTrigger className="h-7 w-auto text-xs bg-secondary border-border px-2 gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {media !== null && (
            <span className="text-xs text-muted-foreground ml-auto">
              Média: <span className="font-semibold text-foreground">{media.toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>

      {/* presença */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Presença</p>
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {disc.currentAbsences} / {maxF} faltas
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {disc.totalClasses} aulas · limite de {maxF} faltas (30%)
                {faltasRestantes > 0
                  ? ` · ${faltasRestantes} restantes antes de reprovar`
                  : " · LIMITE ATINGIDO"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => atualizarFaltas(-1)}
                disabled={disc.currentAbsences === 0}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => atualizarFaltas(1)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-[#ef4444] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(pctF * 100, 100)}%`, background: corBarra }}
            />
          </div>
        </div>
      </section>

      {/* notas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Notas</p>
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary" onClick={() => setAdicionandoNota(true)}>
            <Plus size={12} /> Avaliação
          </Button>
        </div>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {disc.grades.length === 0 && !adicionandoNota ? (
            <p className="text-sm text-muted-foreground p-4">Nenhuma avaliação ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Avaliação</th>
                  <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground w-16">Peso</th>
                  <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground w-20">Nota</th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disc.grades.map(n => (
                  <tr key={n.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => editingNotaId !== n.id && startEditNota(n)}>
                    {editingNotaId === n.id ? (
                      <>
                        <td className="px-4 py-2">
                          <Input value={notaForm.name} onChange={e => setNotaForm(f => ({ ...f, name: e.target.value }))}
                            className="h-7 bg-secondary border-border text-xs" onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="px-3 py-2">
                          <Input type="number" step="0.1" value={notaForm.weight}
                            onChange={e => setNotaForm(f => ({ ...f, weight: e.target.value }))}
                            className="h-7 bg-secondary border-border text-xs text-center" onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="px-3 py-2">
                          <Input type="number" step="0.1" min="0" max="10" value={notaForm.value}
                            onChange={e => setNotaForm(f => ({ ...f, value: e.target.value }))}
                            placeholder="—" className="h-7 bg-secondary border-border text-xs text-center"
                            onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <Button size="sm" className="h-6 text-xs px-2 bg-primary text-primary-foreground" onClick={salvarNota}>✓</Button>
                            <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setEditingNotaId(null)}>✕</Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{n.name}</td>
                        <td className="px-3 py-3 text-center text-muted-foreground">{n.weight}</td>
                        <td className="px-3 py-3 text-center">
                          {n.value !== null ? (
                            <span className={n.value >= 5 ? "text-[#10b981] font-semibold" : "text-[#ef4444] font-semibold"}>
                              {n.value.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); excluirNota(n.id) }}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {adicionandoNota && (
                  <tr>
                    <td className="px-4 py-2">
                      <Input value={novaNotaForm.name} onChange={e => setNovaNotaForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="ex: P1" autoFocus className="h-7 bg-secondary border-border text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <Input type="number" step="0.1" value={novaNotaForm.weight}
                        onChange={e => setNovaNotaForm(f => ({ ...f, weight: e.target.value }))}
                        className="h-7 bg-secondary border-border text-xs text-center" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-xs text-muted-foreground">—</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6 text-xs px-2 bg-primary text-primary-foreground" onClick={adicionarNota}>✓</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setAdicionandoNota(false)}>✕</Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* fórmula */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Fórmula da média</p>
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Use os nomes das avaliações ({disc.grades.map(g => g.name).join(", ") || "nenhuma ainda"}) e operadores matemáticos.
            {!disc.gradeFormula && " Sem fórmula: média ponderada automática pelas notas lançadas."}
          </p>
          <CalculadoraFormula grades={disc.grades} value={formula} onChange={setFormula} />
          <Button
            size="sm"
            onClick={salvarFormula}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Salvar fórmula
          </Button>
          {disc.gradeFormula && (
            <p className="text-xs text-muted-foreground">
              Fórmula salva: <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">{disc.gradeFormula}</code>
            </p>
          )}
        </div>
      </section>

      {/* horários */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Horários</p>
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary" onClick={() => setAdicionandoHorario(true)}>
            <Plus size={12} /> Horário
          </Button>
        </div>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {disc.schedules.length === 0 && !adicionandoHorario ? (
            <p className="text-sm text-muted-foreground p-4">Nenhum horário cadastrado.</p>
          ) : (
            <div className="divide-y divide-border">
              {disc.schedules.map(h => (
                <div key={h.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: disc.color }}
                    />
                    <span className="text-sm font-medium">{DIAS_SEMANA[h.dayOfWeek]}</span>
                    <span className="text-sm text-muted-foreground">{h.startTime} – {h.endTime}</span>
                  </div>
                  <button
                    onClick={() => excluirHorario(h.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {adicionandoHorario && (
                <div className="px-4 py-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Dia</Label>
                      <Select value={horarioForm.dayOfWeek} onValueChange={v => v && setHorarioForm(f => ({ ...f, dayOfWeek: v }))}>
                        <SelectTrigger className="h-8 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {Object.entries(DIAS_SEMANA).map(([v, l]) => (
                            <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Início</Label>
                      <Input type="time" value={horarioForm.startTime}
                        onChange={e => setHorarioForm(f => ({ ...f, startTime: e.target.value }))}
                        className="h-8 bg-secondary border-border text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fim</Label>
                      <Input type="time" value={horarioForm.endTime}
                        onChange={e => setHorarioForm(f => ({ ...f, endTime: e.target.value }))}
                        className="h-8 bg-secondary border-border text-xs" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground" onClick={adicionarHorario}>Adicionar</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAdicionandoHorario(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* dialog editar info */}
      <Dialog open={editInfoOpen} onOpenChange={setEditInfoOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar informações</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input value={infoForm.name} onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
                className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Código</Label>
                <Input value={infoForm.code} onChange={e => setInfoForm(f => ({ ...f, code: e.target.value }))}
                  className="bg-secondary border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Total de aulas *</Label>
                <Input type="number" value={infoForm.totalClasses}
                  onChange={e => setInfoForm(f => ({ ...f, totalClasses: e.target.value }))}
                  className="bg-secondary border-border" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={salvarInfo} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
