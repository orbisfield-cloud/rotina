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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

interface Suplemento {
  id: number
  nome: string
  dose: string
  horario: string
  notas: string | null
  ativo: boolean
}

const HORARIOS = [
  { value: "manha", label: "Manhã" },
  { value: "almoco", label: "Almoço" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "pos-treino", label: "Pós-treino" },
]

function FormSuplemento({
  inicial,
  onSalvar,
}: {
  inicial?: Suplemento
  onSalvar: (dados: Omit<Suplemento, "id" | "ativo">) => Promise<void>
}) {
  const [nome, setNome] = useState(inicial?.nome ?? "")
  const [dose, setDose] = useState(inicial?.dose ?? "")
  const [horario, setHorario] = useState(inicial?.horario ?? "manha")
  const [notas, setNotas] = useState<string>(inicial?.notas ?? "")
  const [salvando, setSalvando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome || !dose || !horario) { toast.error("Preencha todos os campos obrigatórios"); return }
    setSalvando(true)
    await onSalvar({ nome, dose, horario, notas: notas || null })
    setSalvando(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Creatina" className="bg-secondary border-border" />
      </div>
      <div className="space-y-2">
        <Label>Dose *</Label>
        <Input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Ex: 5g" className="bg-secondary border-border" />
      </div>
      <div className="space-y-2">
        <Label>Horário *</Label>
        <Select value={horario} onValueChange={(v) => v && setHorario(v)}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {HORARIOS.map((h) => (
              <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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

export function ConfiguracaoSuplemento() {
  const [suplementos, setSuplementos] = useState<Suplemento[]>([])
  const [editando, setEditando] = useState<Suplemento | null>(null)
  const [abrirNovo, setAbrirNovo] = useState(false)
  const [abrirEditar, setAbrirEditar] = useState(false)

  async function carregar() {
    const res = await fetch("/api/suplementos")
    const dados = await res.json()
    setSuplementos(dados)
  }

  useEffect(() => { carregar() }, [])

  async function criar(dados: Omit<Suplemento, "id" | "ativo">) {
    const res = await fetch("/api/suplementos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
    if (!res.ok) { toast.error("Erro ao criar"); return }
    toast.success("Suplemento criado")
    setAbrirNovo(false)
    carregar()
  }

  async function editar(dados: Omit<Suplemento, "id" | "ativo">) {
    if (!editando) return
    const res = await fetch(`/api/suplementos/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
    if (!res.ok) { toast.error("Erro ao atualizar"); return }
    toast.success("Suplemento atualizado")
    setAbrirEditar(false)
    setEditando(null)
    carregar()
  }

  async function toggleAtivo(s: Suplemento) {
    await fetch(`/api/suplementos/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !s.ativo }),
    })
    toast.success(s.ativo ? "Suplemento desativado" : "Suplemento ativado")
    carregar()
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este suplemento?")) return
    await fetch(`/api/suplementos/${id}`, { method: "DELETE" })
    toast.success("Suplemento excluído")
    carregar()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={abrirNovo} onOpenChange={setAbrirNovo}>
          <DialogTrigger render={<Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" />}>
            <Plus size={15} /> Novo suplemento
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Novo suplemento</DialogTitle>
            </DialogHeader>
            <FormSuplemento onSalvar={criar} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {suplementos.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{s.nome}</p>
                  {!s.ativo && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{s.dose} · {s.horario}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7"
                onClick={() => toggleAtivo(s)}
              >
                {s.ativo ? "Desativar" : "Ativar"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => { setEditando(s); setAbrirEditar(true) }}
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => excluir(s.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={abrirEditar} onOpenChange={(v) => { setAbrirEditar(v); if (!v) setEditando(null) }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Editar suplemento</DialogTitle>
          </DialogHeader>
          {editando && <FormSuplemento inicial={editando} onSalvar={editar} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
