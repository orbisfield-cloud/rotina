"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

interface Medida {
  id: number
  data: string | Date
  peso: number
  massaMuscular: number | null
  gorduraSubcutanea: number | null
  fonte: string
  notas: string | null
}

const FONTES = [
  { value: "bioimpedancia", label: "Bioimpedância" },
  { value: "balanca", label: "Balança comum" },
]

function FormMedida({ inicial, onSalvar }: { inicial?: Medida; onSalvar: (dados: Partial<Medida>) => Promise<void> }) {
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
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {FONTES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Peso (kg) *</Label>
          <Input type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="93.1" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Massa muscular (kg)</Label>
          <Input type="number" step="0.1" value={massa} onChange={(e) => setMassa(e.target.value)} placeholder="50.9" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Gordura subcutânea (%)</Label>
          <Input type="number" step="0.1" value={gordura} onChange={(e) => setGordura(e.target.value)} placeholder="8.6" className="bg-secondary border-border" />
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

export function PesoManager() {
  const [medidas, setMedidas] = useState<Medida[]>([])
  const [editando, setEditando] = useState<Medida | null>(null)
  const [abrirNovo, setAbrirNovo] = useState(false)
  const [abrirEditar, setAbrirEditar] = useState(false)

  async function carregar() {
    const res = await fetch("/api/peso")
    setMedidas(await res.json())
  }

  useEffect(() => { carregar() }, [])

  async function criar(dados: Partial<Medida>) {
    const res = await fetch("/api/peso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
    if (!res.ok) { toast.error("Erro ao criar"); return }
    toast.success("Medida registrada")
    setAbrirNovo(false)
    carregar()
  }

  async function editar(dados: Partial<Medida>) {
    if (!editando) return
    const res = await fetch(`/api/peso/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
    if (!res.ok) { toast.error("Erro ao atualizar"); return }
    toast.success("Medida atualizada")
    setAbrirEditar(false)
    setEditando(null)
    carregar()
  }

  async function excluir(id: number) {
    if (!confirm("Excluir esta medida?")) return
    await fetch(`/api/peso/${id}`, { method: "DELETE" })
    toast.success("Medida excluída")
    carregar()
  }

  const dadosGrafico = [...medidas].reverse().map((m) => ({
    dataLabel: format(new Date(m.data), "dd/MM", { locale: ptBR }),
    peso: m.peso,
    massa: m.massaMuscular ?? undefined,
    gordura: m.gorduraSubcutanea ?? undefined,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setAbrirNovo(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus size={15} /> Registrar medida
        </Button>
      </div>

      {dadosGrafico.length > 1 && (
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Evolução</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dadosGrafico} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252932" />
              <XAxis dataKey="dataLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1a1d26", border: "1px solid #252932", borderRadius: 8 }} labelStyle={{ color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={2} dot={false} name="Peso (kg)" />
              <Line type="monotone" dataKey="massa" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Massa (kg)" />
              <Line type="monotone" dataKey="gordura" stroke="#f59e0b" strokeWidth={2} dot={false} name="Gordura (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Data</TableHead>
              <TableHead className="text-muted-foreground">Peso</TableHead>
              <TableHead className="text-muted-foreground">Massa</TableHead>
              <TableHead className="text-muted-foreground">Gordura</TableHead>
              <TableHead className="text-muted-foreground">Fonte</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medidas.map((m) => (
              <TableRow key={m.id} className="border-border hover:bg-secondary/50">
                <TableCell className="text-sm">{format(new Date(m.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell className="text-sm tabular">{m.peso}kg</TableCell>
                <TableCell className="text-sm tabular">{m.massaMuscular ? `${m.massaMuscular}kg` : "—"}</TableCell>
                <TableCell className="text-sm tabular">{m.gorduraSubcutanea ? `${m.gorduraSubcutanea}%` : "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{m.fonte}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => { setEditando(m); setAbrirEditar(true) }}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => excluir(m.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={abrirNovo} onOpenChange={setAbrirNovo}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Registrar medida</DialogTitle></DialogHeader>
          <FormMedida onSalvar={criar} />
        </DialogContent>
      </Dialog>

      <Dialog open={abrirEditar} onOpenChange={(v) => { setAbrirEditar(v); if (!v) setEditando(null) }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar medida</DialogTitle></DialogHeader>
          {editando && <FormMedida inicial={editando} onSalvar={editar} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
