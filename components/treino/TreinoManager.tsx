"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Plus, Dumbbell, Footprints } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

interface Treino {
  id: number
  data: string | Date
  tipo: string
  duracao: number
  intensidade: number | null
  notas: string | null
  criadoEm: string | Date
}

const TIPOS = [
  { value: "musculacao", label: "Musculação" },
  { value: "futebol", label: "Futebol" },
  { value: "outro", label: "Outro" },
]

const TIPO_BADGE: Record<string, { label: string; color: string }> = {
  musculacao: { label: "Musculação", color: "bg-[#8b5cf6]/20 text-[#8b5cf6]" },
  futebol: { label: "Futebol", color: "bg-[#10b981]/20 text-[#10b981]" },
  outro: { label: "Outro", color: "bg-secondary text-muted-foreground" },
}

function FormTreino({
  inicial,
  onSalvar,
}: {
  inicial?: Treino
  onSalvar: (dados: Partial<Treino>) => Promise<void>
}) {
  const [data, setData] = useState(
    inicial ? format(new Date(inicial.data), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  )
  const [tipo, setTipo] = useState(inicial?.tipo ?? "musculacao")
  const [duracao, setDuracao] = useState(String(inicial?.duracao ?? ""))
  const [intensidade, setIntensidade] = useState(String(inicial?.intensidade ?? ""))
  const [notas, setNotas] = useState(inicial?.notas ?? "")
  const [salvando, setSalvando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!data || !tipo || !duracao) { toast.error("Preencha data, tipo e duração"); return }
    setSalvando(true)
    await onSalvar({ data, tipo, duracao: Number(duracao), intensidade: intensidade ? Number(intensidade) : undefined, notas: notas || undefined })
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
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={(v) => v && setTipo(v)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {TIPOS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duração (min) *</Label>
          <Input type="number" value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="60" className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label>Intensidade (1–10)</Label>
          <Input type="number" min={1} max={10} value={intensidade} onChange={(e) => setIntensidade(e.target.value)} placeholder="7" className="bg-secondary border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Grupos musculares, observações..." className="bg-secondary border-border resize-none" rows={2} />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={salvando} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function TreinoManager() {
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [editando, setEditando] = useState<Treino | null>(null)
  const [abrirNovo, setAbrirNovo] = useState(false)
  const [abrirEditar, setAbrirEditar] = useState(false)

  async function carregar() {
    const res = await fetch("/api/treino")
    setTreinos(await res.json())
  }

  useEffect(() => { carregar() }, [])

  async function criar(dados: Partial<Treino>) {
    const res = await fetch("/api/treino", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
    if (!res.ok) { toast.error("Erro ao criar"); return }
    toast.success("Treino registrado")
    setAbrirNovo(false)
    carregar()
  }

  async function editar(dados: Partial<Treino>) {
    if (!editando) return
    const res = await fetch(`/api/treino/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
    if (!res.ok) { toast.error("Erro ao atualizar"); return }
    toast.success("Treino atualizado")
    setAbrirEditar(false)
    setEditando(null)
    carregar()
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este treino?")) return
    await fetch(`/api/treino/${id}`, { method: "DELETE" })
    toast.success("Treino excluído")
    carregar()
  }

  const musculacao = treinos.filter((t) => t.tipo === "musculacao").length
  const futebol = treinos.filter((t) => t.tipo === "futebol").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-[#8b5cf6]"><Dumbbell size={14} /> {musculacao} musculação</span>
          <span className="flex items-center gap-1.5 text-[#10b981]"><Footprints size={14} /> {futebol} futebol</span>
        </div>
        <Button onClick={() => setAbrirNovo(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus size={15} /> Registrar treino
        </Button>
      </div>

      <div className="space-y-2">
        {treinos.map((t) => {
          const diasAtras = differenceInDays(new Date(), new Date(t.data))
          const badge = TIPO_BADGE[t.tipo] ?? TIPO_BADGE.outro
          return (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                <div>
                  <p className="text-sm font-medium">{format(new Date(t.data), "dd/MM/yyyy", { locale: ptBR })}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.duracao}min
                    {t.intensidade ? ` · Intensidade ${t.intensidade}/10` : ""}
                    {diasAtras === 0 ? " · hoje" : diasAtras === 1 ? " · ontem" : ` · ${diasAtras}d atrás`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditando(t); setAbrirEditar(true) }}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => excluir(t.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={abrirNovo} onOpenChange={setAbrirNovo}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Registrar treino</DialogTitle></DialogHeader>
          <FormTreino onSalvar={criar} />
        </DialogContent>
      </Dialog>

      <Dialog open={abrirEditar} onOpenChange={(v) => { setAbrirEditar(v); if (!v) setEditando(null) }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar treino</DialogTitle></DialogHeader>
          {editando && <FormTreino inicial={editando} onSalvar={editar} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
