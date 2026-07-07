"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Plus, Trophy } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

const BASELINE_FILIPE = { peso: 93.1, massaMuscular: 50.9, gorduraSubcutanea: 8.6 }
const BASELINE_JULIA = { peso: 76.15, massaMuscular: 38.3, gorduraSubcutanea: 18.5 }

interface Medida {
  id: number
  data: string | Date
  peso: number
  massaMuscular: number | null
  gorduraSubcutanea: number | null
  fonte: string
  notas: string | null
  pessoa: string
}

interface DadosDesafio {
  diasRestantes: number
  diasTotais: number
  diasDecorridos: number
  filipe: { atual: Medida | null; deltaMassa: number | null; deltaGordura: number | null; historico: Medida[] }
  julia: { atual: Medida | null; deltaMassa: number | null; deltaGordura: number | null; historico: Medida[] }
}

const FONTES = [
  { value: "bioimpedancia", label: "Bioimpedância" },
  { value: "balanca", label: "Balança comum" },
]

function DeltaBadge({ valor, invertido = false }: { valor: number | null; invertido?: boolean }) {
  if (valor === null) return <span className="text-muted-foreground">—</span>
  const positivo = invertido ? valor < 0 : valor > 0
  const cls = positivo ? "text-[#10b981]" : "text-[#ef4444]"
  const unidade = invertido ? "%" : "kg"
  return (
    <span className={cls}>
      {valor > 0 ? "+" : ""}{valor.toFixed(1)}{unidade}
    </span>
  )
}

function FormMedidaJulia({ inicial, onSalvar }: { inicial?: Medida; onSalvar: (d: Partial<Medida>) => Promise<void> }) {
  const [data, setData] = useState(inicial ? format(new Date(inicial.data), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"))
  const [peso, setPeso] = useState(String(inicial?.peso ?? ""))
  const [massa, setMassa] = useState(String(inicial?.massaMuscular ?? ""))
  const [gordura, setGordura] = useState(String(inicial?.gorduraSubcutanea ?? ""))
  const [fonte, setFonte] = useState(inicial?.fonte ?? "bioimpedancia")
  const [notas, setNotas] = useState(inicial?.notas ?? "")
  const [salvando, setSalvando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!data || !peso || !fonte) { toast.error("Preencha data, peso e fonte"); return }
    setSalvando(true)
    await onSalvar({
      data,
      peso: Number(peso),
      massaMuscular: massa ? Number(massa) : undefined,
      gorduraSubcutanea: gordura ? Number(gordura) : undefined,
      fonte,
      notas: notas || undefined,
    })
    setSalvando(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data *</Label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Fonte *</Label>
          <Select value={fonte} onValueChange={(v) => v && setFonte(v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {FONTES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Peso (kg) *</Label>
          <Input type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="76.15" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Massa muscular (kg)</Label>
          <Input type="number" step="0.1" value={massa} onChange={(e) => setMassa(e.target.value)} placeholder="38.3" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Gordura subcutânea (%)</Label>
          <Input type="number" step="0.1" value={gordura} onChange={(e) => setGordura(e.target.value)} placeholder="18.5" className="bg-secondary border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observações..." className="bg-secondary border-border resize-none" rows={2} />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={salvando} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function DesafioManager() {
  const [dados, setDados] = useState<DadosDesafio | null>(null)
  const [editando, setEditando] = useState<Medida | null>(null)
  const [abrirNovo, setAbrirNovo] = useState(false)
  const [abrirEditar, setAbrirEditar] = useState(false)

  async function carregar() {
    const res = await fetch("/api/desafio")
    setDados(await res.json())
  }

  useEffect(() => { carregar() }, [])

  async function criarJulia(d: Partial<Medida>) {
    const res = await fetch("/api/desafio/julia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    })
    if (!res.ok) { toast.error("Erro ao criar"); return }
    toast.success("Medida da Julia registrada")
    setAbrirNovo(false)
    carregar()
  }

  async function editarJulia(d: Partial<Medida>) {
    if (!editando) return
    const res = await fetch(`/api/desafio/julia/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    })
    if (!res.ok) { toast.error("Erro ao atualizar"); return }
    toast.success("Medida atualizada")
    setAbrirEditar(false)
    setEditando(null)
    carregar()
  }

  async function excluirJulia(id: number) {
    if (!confirm("Excluir esta medida?")) return
    await fetch(`/api/desafio/julia/${id}`, { method: "DELETE" })
    toast.success("Medida excluída")
    carregar()
  }

  if (!dados) return <p className="text-muted-foreground text-sm">Carregando...</p>

  const progresso = Math.round((dados.diasDecorridos / dados.diasTotais) * 100)

  const graficoMassa = dados.filipe.historico.map((m) => ({
    dataLabel: format(new Date(m.data), "dd/MM", { locale: ptBR }),
    filipe: m.massaMuscular ?? undefined,
  })).map((row, i) => ({
    ...row,
    julia: dados.julia.historico[i]?.massaMuscular ?? undefined,
  }))

  const graficoGordura = dados.filipe.historico.map((m) => ({
    dataLabel: format(new Date(m.data), "dd/MM", { locale: ptBR }),
    filipe: m.gorduraSubcutanea ?? undefined,
  })).map((row, i) => ({
    ...row,
    julia: dados.julia.historico[i]?.gorduraSubcutanea ?? undefined,
  }))

  return (
    <div className="space-y-6">
      {/* countdown */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Trophy size={15} className="text-[#f59e0b]" /> Término: 07/09/2026</p>
          <span className="text-xs text-muted-foreground">{progresso}% decorrido</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold tabular text-[#f59e0b]">{dados.diasRestantes}</span>
          <span className="text-lg text-muted-foreground mb-1">dias restantes</span>
        </div>
        <Progress value={progresso} className="h-2" />
      </div>

      {/* placar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filipe</p>
          <p className="text-xs text-muted-foreground">Baseline: {BASELINE_FILIPE.massaMuscular}kg massa · {BASELINE_FILIPE.gorduraSubcutanea}% gordura</p>
          <div className="space-y-1 text-sm">
            <div>Massa <DeltaBadge valor={dados.filipe.deltaMassa} /></div>
            <div>Gordura <DeltaBadge valor={dados.filipe.deltaGordura} invertido /></div>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Julia</p>
            <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 text-primary" onClick={() => setAbrirNovo(true)}>
              <Plus size={12} /> Medida
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Baseline: {BASELINE_JULIA.massaMuscular}kg massa · {BASELINE_JULIA.gorduraSubcutanea}% gordura</p>
          <div className="space-y-1 text-sm">
            <div>Massa <DeltaBadge valor={dados.julia.deltaMassa} /></div>
            <div>Gordura <DeltaBadge valor={dados.julia.deltaGordura} invertido /></div>
          </div>
        </div>
      </div>

      {/* histórico julia */}
      {dados.julia.historico.length > 0 && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-muted-foreground">Medidas da Julia</p>
          </div>
          <div className="divide-y divide-border">
            {dados.julia.historico.slice().reverse().map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm">{format(new Date(m.data), "dd/MM/yyyy", { locale: ptBR })}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.peso}kg
                    {m.massaMuscular ? ` · ${m.massaMuscular}kg massa` : ""}
                    {m.gorduraSubcutanea ? ` · ${m.gorduraSubcutanea}% gordura` : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => { setEditando(m); setAbrirEditar(true) }}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => excluirJulia(m.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* gráficos comparativos */}
      {graficoMassa.some((d) => d.filipe || d.julia) && (
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Massa muscular (kg)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={graficoMassa} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252932" />
              <XAxis dataKey="dataLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1a1d26", border: "1px solid #252932", borderRadius: 8 }} labelStyle={{ color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Line type="monotone" dataKey="filipe" stroke="#10b981" strokeWidth={2} dot={false} name="Filipe" />
              <Line type="monotone" dataKey="julia" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Julia" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <Dialog open={abrirNovo} onOpenChange={setAbrirNovo}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nova medida — Julia</DialogTitle></DialogHeader>
          <FormMedidaJulia onSalvar={criarJulia} />
        </DialogContent>
      </Dialog>

      <Dialog open={abrirEditar} onOpenChange={(v) => { setAbrirEditar(v); if (!v) setEditando(null) }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar medida — Julia</DialogTitle></DialogHeader>
          {editando && <FormMedidaJulia inicial={editando} onSalvar={editarJulia} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
