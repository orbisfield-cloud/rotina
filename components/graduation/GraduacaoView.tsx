"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, ChevronRight, Calendar } from "lucide-react"
import { toast } from "sonner"
import { calcularMedia, maxFaltas, corBarraFaltas, STATUS_LABELS, STATUS_COLORS } from "@/lib/graduation-utils"

interface Nota { id: string; name: string; value: number | null; weight: number }
interface Horario { id: string; dayOfWeek: number; startTime: string; endTime: string }
interface Disciplina {
  id: string; name: string; code: string | null; color: string
  totalClasses: number; currentAbsences: number; gradeFormula: string | null
  status: string; grades: Nota[]; schedules: Horario[]
}
interface Semester { id: string; name: string; active: boolean }
interface SemestreAtivo extends Semester { disciplines: Disciplina[] }

interface Props {
  initialSemestres: Semester[]
  initialSemestreAtivo: SemestreAtivo | null
}

export function GraduacaoView({ initialSemestres, initialSemestreAtivo }: Props) {
  const [semestres, setSemestres] = useState(initialSemestres)
  const [semestreAtivo, setSemestreAtivo] = useState(initialSemestreAtivo)
  const [abrirNovaSem, setAbrirNovaSem] = useState(false)
  const [nomeSem, setNomeSem] = useState("")
  const [abrirNovaDisc, setAbrirNovaDisc] = useState(false)
  const [discForm, setDiscForm] = useState({ name: "", code: "", totalClasses: "" })

  async function recarregar() {
    const res = await fetch("/api/graduation")
    const data = await res.json()
    setSemestres(data.semestres)
    setSemestreAtivo(data.semestreAtivo)
  }

  async function criarSemestre() {
    if (!nomeSem.trim()) { toast.error("Nome obrigatório"); return }
    const res = await fetch("/api/graduation/semestres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nomeSem.trim() }),
    })
    if (!res.ok) { toast.error("Erro ao criar semestre"); return }
    toast.success("Semestre criado")
    setNomeSem("")
    setAbrirNovaSem(false)
    recarregar()
  }

  async function ativarSemestre(id: string) {
    await fetch(`/api/graduation/semestres/${id}`, { method: "PUT" })
    recarregar()
  }

  async function criarDisciplina() {
    if (!discForm.name.trim() || !discForm.totalClasses || !semestreAtivo) {
      toast.error("Preencha nome e total de aulas"); return
    }
    const res = await fetch("/api/graduation/disciplinas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: discForm.name.trim(),
        code: discForm.code.trim() || null,
        semesterId: semestreAtivo.id,
        totalClasses: Number(discForm.totalClasses),
      }),
    })
    if (!res.ok) { toast.error("Erro ao criar disciplina"); return }
    toast.success("Disciplina criada")
    setDiscForm({ name: "", code: "", totalClasses: "" })
    setAbrirNovaDisc(false)
    recarregar()
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Graduação</h1>
        <Link
          href="/graduacao/grade"
          className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full hover:bg-secondary/80 transition-colors"
        >
          <Calendar size={12} /> Grade Horária
        </Link>
      </div>

      {/* seletor de semestres */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Semestre</p>
          <button
            onClick={() => setAbrirNovaSem(true)}
            className="text-xs text-primary flex items-center gap-1 hover:opacity-80"
          >
            <Plus size={12} /> Novo
          </button>
        </div>
        {semestres.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">Nenhum semestre criado ainda.</p>
            <Button size="sm" onClick={() => setAbrirNovaSem(true)} className="gap-1.5">
              <Plus size={13} /> Criar semestre
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {semestres.map(s => (
              <button
                key={s.id}
                onClick={() => !s.active && ativarSemestre(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  s.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.name}
                {s.active && " ·"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* disciplinas */}
      {semestreAtivo && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Disciplinas — {semestreAtivo.name}
            </p>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary" onClick={() => setAbrirNovaDisc(true)}>
              <Plus size={12} /> Disciplina
            </Button>
          </div>

          {semestreAtivo.disciplines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Nenhuma disciplina neste semestre.</p>
              <Button size="sm" onClick={() => setAbrirNovaDisc(true)} className="gap-1.5">
                <Plus size={13} /> Adicionar disciplina
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {semestreAtivo.disciplines.map(d => {
                const maxF = maxFaltas(d.totalClasses)
                const pctF = maxF > 0 ? d.currentAbsences / maxF : 0
                const media = calcularMedia(d.grades, d.gradeFormula)
                const corBarra = corBarraFaltas(d.currentAbsences, maxF)
                const faltasRestantes = Math.max(0, maxF - d.currentAbsences)

                return (
                  <Link
                    key={d.id}
                    href={`/graduacao/${d.id}`}
                    className="block rounded-xl bg-card border border-border p-4 hover:border-[#252932] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                          style={{ background: d.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">{d.name}</p>
                          {d.code && <p className="text-xs text-muted-foreground mt-0.5">{d.code}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[d.status] ?? STATUS_COLORS.in_progress}`}>
                          {STATUS_LABELS[d.status] ?? d.status}
                        </span>
                        <ChevronRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {d.currentAbsences}/{maxF} faltas
                          {faltasRestantes > 0 ? ` · ${faltasRestantes} restantes` : " · LIMITE ATINGIDO"}
                        </span>
                        <span>
                          {media !== null ? `Média: ${media.toFixed(2)}` : "Sem notas"}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(pctF * 100, 100)}%`, background: corBarra }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* dialog novo semestre */}
      <Dialog open={abrirNovaSem} onOpenChange={setAbrirNovaSem}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Novo semestre</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={nomeSem}
                onChange={e => setNomeSem(e.target.value)}
                placeholder="ex: 2026.1"
                className="bg-secondary border-border"
                onKeyDown={e => e.key === "Enter" && criarSemestre()}
              />
            </div>
            <DialogFooter>
              <Button onClick={criarSemestre} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Criar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* dialog nova disciplina */}
      <Dialog open={abrirNovaDisc} onOpenChange={setAbrirNovaDisc}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nova disciplina</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={discForm.name}
                onChange={e => setDiscForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex: Cálculo I"
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Código</Label>
                <Input
                  value={discForm.code}
                  onChange={e => setDiscForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="ex: LCE0120"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Total de aulas *</Label>
                <Input
                  type="number"
                  min="1"
                  value={discForm.totalClasses}
                  onChange={e => setDiscForm(f => ({ ...f, totalClasses: e.target.value }))}
                  placeholder="ex: 60"
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={criarDisciplina} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Criar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
