"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Circle, FolderPlus, ChevronDown, ChevronRight, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Tarefa {
  id: string
  title: string
  description: string | null
  effort: string
  dueDate: Date | null
  nextSessionNote: string | null
  consequenceChain: string | null
  folderId: string | null
  recurrence: string | null
}

interface Pasta {
  id: string
  name: string
  tasks: Tarefa[]
}

interface Sistema {
  id: string
  name: string
  icon: string | null
  color: string | null
  isDefault: boolean
  folders: Pasta[]
  tasks: Tarefa[]
}

const ESFORCOS = [
  { value: "high", label: "Dia bom" },
  { value: "low", label: "Dia ruim" },
  { value: "any", label: "Qualquer dia" },
]

const RECORRENCIAS = [
  { value: "", label: "Única" },
  { value: "daily", label: "Diária" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
]

const ESFORCO_BADGE: Record<string, string> = {
  high: "bg-[#10b981]/15 text-[#10b981]",
  low: "bg-[#8b5cf6]/15 text-[#8b5cf6]",
  any: "bg-secondary text-muted-foreground",
}

function TaskItem({ tarefa, onDone, onEdit, onDelete }: {
  tarefa: Tarefa
  onDone: (id: string) => void
  onEdit: (t: Tarefa) => void
  onDelete: (id: string) => void
}) {
  const [expandida, setExpandida] = useState(false)
  const temDetalhes = !!(tarefa.nextSessionNote || tarefa.consequenceChain)

  return (
    <div className="rounded-xl bg-secondary/40 border border-border/50 overflow-hidden">
      <div className="flex items-start gap-2.5 p-3">
        <button onClick={() => onDone(tarefa.id)} className="mt-0.5 shrink-0 text-muted-foreground hover:text-[#10b981] transition-colors">
          <Circle size={15} />
        </button>
        <div
          className={`flex-1 min-w-0 space-y-1 ${temDetalhes ? "cursor-pointer select-none" : ""}`}
          onClick={() => temDetalhes && setExpandida(v => !v)}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-snug">{tarefa.title}</p>
            <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
              {tarefa.recurrence && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400 flex items-center gap-0.5">
                  <RefreshCw size={9} />
                  {RECORRENCIAS.find(r => r.value === tarefa.recurrence)?.label ?? tarefa.recurrence}
                </span>
              )}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ESFORCO_BADGE[tarefa.effort] ?? ESFORCO_BADGE.any}`}>
                {ESFORCOS.find(e => e.value === tarefa.effort)?.label}
              </span>
              {temDetalhes && (
                <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${expandida ? "rotate-180" : ""}`} />
              )}
            </div>
          </div>
          {tarefa.dueDate && (
            <p className="text-xs text-muted-foreground">vence {format(new Date(tarefa.dueDate), "dd/MM/yyyy", { locale: ptBR })}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => onEdit(tarefa)}>
            <Pencil size={12} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onDelete(tarefa.id)}>
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
      {expandida && temDetalhes && (
        <div className="px-3 pb-3 ml-5 space-y-2">
          {tarefa.nextSessionNote && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Próxima sessão</p>
              <div className="rounded-lg bg-background px-2.5 py-1.5 text-xs">{tarefa.nextSessionNote}</div>
            </div>
          )}
          {tarefa.consequenceChain && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cadeia de consequências</p>
              <div className="rounded-lg bg-background px-2.5 py-1.5 text-xs whitespace-pre-wrap">{tarefa.consequenceChain}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TarefaForm({
  inicial,
  systemId,
  pastas,
  onSalvar,
}: {
  inicial?: Tarefa
  systemId: string
  pastas: Pasta[]
  onSalvar: (d: Record<string, unknown>) => Promise<void>
}) {
  const [title, setTitle] = useState(inicial?.title ?? "")
  const [description, setDescription] = useState(inicial?.description ?? "")
  const [effort, setEffort] = useState(inicial?.effort ?? "high")
  const [folderId, setFolderId] = useState(inicial?.folderId ?? "")
  const [dueDate, setDueDate] = useState(inicial?.dueDate ? format(new Date(inicial.dueDate), "yyyy-MM-dd") : "")
  const [nextSessionNote, setNextSessionNote] = useState(inicial?.nextSessionNote ?? "")
  const [consequenceChain, setConsequenceChain] = useState(inicial?.consequenceChain ?? "")
  const [recurrence, setRecurrence] = useState(inicial?.recurrence ?? "")
  const [salvando, setSalvando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { toast.error("Título obrigatório"); return }
    setSalvando(true)
    await onSalvar({
      title: title.trim(),
      description: description || null,
      systemId,
      folderId: folderId || null,
      effort,
      dueDate: dueDate || null,
      nextSessionNote: nextSessionNote || null,
      consequenceChain: consequenceChain || null,
      recurrence: recurrence || null,
    })
    setSalvando(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Título *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="O que precisa ser feito?" className="bg-secondary border-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Esforço</Label>
          <Select value={effort} onValueChange={v => v && setEffort(v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {ESFORCOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Recorrência</Label>
          <Select value={recurrence || "_none"} onValueChange={v => v != null && setRecurrence(v === "_none" ? "" : v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="_none">Única</SelectItem>
              <SelectItem value="daily">Diária</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Pasta</Label>
          <Select value={folderId || "_none"} onValueChange={v => v != null && setFolderId(v === "_none" ? "" : v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Sem pasta" /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="_none">Sem pasta</SelectItem>
              {pastas.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Data limite</Label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-secondary border-border" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Próxima sessão começa por...</Label>
        <Input value={nextSessionNote} onChange={e => setNextSessionNote(e.target.value)} placeholder="ex: abrir o arquivo X na linha Y" className="bg-secondary border-border" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Cadeia de consequências</Label>
        <Textarea value={consequenceChain} onChange={e => setConsequenceChain(e.target.value)} placeholder="Tarefa feita → o que muda? → e depois? → e depois? → qual liberdade isso aproxima?" rows={3} className="bg-secondary border-border resize-none text-xs" />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={salvando} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  )
}

const TAREFA_VAZIA: Tarefa = {
  id: "", title: "", description: null, effort: "high",
  dueDate: null, nextSessionNote: null, consequenceChain: null,
  folderId: null, recurrence: null,
}

export function SystemDetail({ sistemaInicial }: { sistemaInicial: Sistema }) {
  const [sistema, setSistema] = useState(sistemaInicial)
  const [editandoTarefa, setEditandoTarefa] = useState<Tarefa | null>(null)
  const [novaTarefaPastaId, setNovaTarefaPastaId] = useState<string | null | undefined>(undefined)
  const [nomePasta, setNomePasta] = useState("")
  const [editandoPasta, setEditandoPasta] = useState<Pasta | null>(null)
  const [pastasColapsadas, setPastasColapsadas] = useState<Set<string>>(new Set())

  async function carregar() {
    const res = await fetch(`/api/systems/${sistema.id}`)
    setSistema(await res.json())
  }

  async function criarTarefa(data: Record<string, unknown>) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Erro ao criar tarefa"); return }
    toast.success("Tarefa criada")
    setNovaTarefaPastaId(undefined)
    carregar()
  }

  async function editarTarefa(data: Record<string, unknown>) {
    if (!editandoTarefa) return
    await fetch(`/api/tasks/${editandoTarefa.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    toast.success("Tarefa atualizada")
    setEditandoTarefa(null)
    carregar()
  }

  async function marcarFeita(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    })
    toast.success("Concluída!")
    carregar()
  }

  async function deletarTarefa(id: string) {
    if (!confirm("Excluir tarefa?")) return
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    toast.success("Tarefa excluída")
    carregar()
  }

  async function criarPasta() {
    if (!nomePasta.trim()) return
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nomePasta.trim(), systemId: sistema.id }),
    })
    toast.success("Pasta criada")
    setNomePasta("")
    carregar()
  }

  async function renomearPasta() {
    if (!editandoPasta || !nomePasta.trim()) return
    await fetch(`/api/folders/${editandoPasta.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nomePasta.trim() }),
    })
    toast.success("Pasta renomeada")
    setEditandoPasta(null)
    setNomePasta("")
    carregar()
  }

  async function deletarPasta(id: string) {
    if (!confirm("Excluir pasta? As tarefas ficam sem pasta.")) return
    await fetch(`/api/folders/${id}`, { method: "DELETE" })
    toast.success("Pasta excluída")
    carregar()
  }

  function togglePasta(id: string) {
    setPastasColapsadas(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const todasPastas = sistema.folders

  return (
    <div className="space-y-5">
      {/* nova pasta */}
      <div className="flex gap-2">
        <Input
          value={nomePasta}
          onChange={e => setNomePasta(e.target.value)}
          placeholder="Nova pasta..."
          className="bg-secondary border-border text-sm"
          onKeyDown={e => e.key === "Enter" && criarPasta()}
        />
        <Button onClick={criarPasta} variant="outline" className="gap-1.5 shrink-0">
          <FolderPlus size={14} /> Pasta
        </Button>
      </div>

      {/* tarefas sem pasta */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Geral</p>
          <Button
            size="sm" variant="ghost" className="h-6 text-xs gap-1 text-primary"
            onClick={() => setNovaTarefaPastaId(null)}
          >
            <Plus size={12} /> Tarefa
          </Button>
        </div>
        {sistema.tasks.map(t => (
          <TaskItem key={t.id} tarefa={t} onDone={marcarFeita} onEdit={setEditandoTarefa} onDelete={deletarTarefa} />
        ))}
        {sistema.tasks.length === 0 && (
          <p className="text-xs text-muted-foreground">Sem tarefas gerais.</p>
        )}
      </div>

      {/* pastas */}
      {todasPastas.map(pasta => {
        const colapsada = pastasColapsadas.has(pasta.id)
        return (
          <div key={pasta.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => togglePasta(pasta.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
              >
                {colapsada ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                {pasta.name}
                <span className="normal-case font-normal">({pasta.tasks.length})</span>
              </button>
              <div className="flex items-center gap-1">
                <Button
                  size="sm" variant="ghost" className="h-6 text-xs gap-1 text-primary"
                  onClick={() => setNovaTarefaPastaId(pasta.id)}
                >
                  <Plus size={12} /> Tarefa
                </Button>
                <Button
                  size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => { setEditandoPasta(pasta); setNomePasta(pasta.name) }}
                >
                  <Pencil size={11} />
                </Button>
                <Button
                  size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => deletarPasta(pasta.id)}
                >
                  <Trash2 size={11} />
                </Button>
              </div>
            </div>
            {!colapsada && pasta.tasks.map(t => (
              <TaskItem key={t.id} tarefa={t} onDone={marcarFeita} onEdit={setEditandoTarefa} onDelete={deletarTarefa} />
            ))}
            {!colapsada && pasta.tasks.length === 0 && (
              <p className="text-xs text-muted-foreground pl-1">Pasta vazia.</p>
            )}
          </div>
        )
      })}

      {/* dialog nova tarefa */}
      <Dialog open={novaTarefaPastaId !== undefined} onOpenChange={v => !v && setNovaTarefaPastaId(undefined)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nova tarefa</DialogTitle></DialogHeader>
          {novaTarefaPastaId !== undefined && (
            <TarefaForm
              systemId={sistema.id}
              pastas={todasPastas}
              inicial={novaTarefaPastaId !== null ? { ...TAREFA_VAZIA, folderId: novaTarefaPastaId } : undefined}
              onSalvar={criarTarefa}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* dialog editar tarefa */}
      <Dialog open={!!editandoTarefa} onOpenChange={v => !v && setEditandoTarefa(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar tarefa</DialogTitle></DialogHeader>
          {editandoTarefa && (
            <TarefaForm
              inicial={editandoTarefa}
              systemId={sistema.id}
              pastas={todasPastas}
              onSalvar={editarTarefa}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* dialog renomear pasta */}
      <Dialog open={!!editandoPasta} onOpenChange={v => { if (!v) { setEditandoPasta(null); setNomePasta("") } }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Renomear pasta</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={nomePasta} onChange={e => setNomePasta(e.target.value)} className="bg-secondary border-border" />
            <DialogFooter>
              <Button onClick={renomearPasta} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
