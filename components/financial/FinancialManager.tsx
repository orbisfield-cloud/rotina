"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pencil, Trash2, TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Entrada {
  id: string
  date: string | Date
  type: string
  amount: number
  description: string
  category: string | null
  method: string | null
}

interface Resumo {
  receitas: number
  despesas: number
  saldo: number
  entradas: Entrada[]
}

interface Config {
  id: string
  cardLimit: number
}

const METHOD_LABELS: Record<string, string> = {
  card: "💳 Cartão",
  cash: "💵 Dinheiro",
  pix:  "💸 Pix",
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function EntradaForm({
  tipo,
  inicial,
  onSalvar,
}: {
  tipo: "income" | "expense"
  inicial?: Entrada
  onSalvar: (d: Record<string, unknown>) => Promise<void>
}) {
  const [date, setDate] = useState(
    inicial
      ? String(inicial.date).slice(0, 10)
      : format(new Date(), "yyyy-MM-dd")
  )
  const [amount, setAmount] = useState(String(inicial?.amount ?? ""))
  const [description, setDescription] = useState(inicial?.description ?? "")
  const [category, setCategory] = useState(inicial?.category ?? "")
  const [method, setMethod] = useState(inicial?.method ?? "card")
  const [salvando, setSalvando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !description.trim()) { toast.error("Preencha valor e descrição"); return }
    setSalvando(true)
    await onSalvar({
      date,
      type: tipo,
      amount: Number(amount),
      description: description.trim(),
      category: category || null,
      method: tipo === "expense" ? method : null,
    })
    setSalvando(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Data</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Valor (R$) *</Label>
          <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" className="bg-secondary border-border" />
        </div>
      </div>
      {tipo === "expense" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Método *</Label>
          <Select value={method} onValueChange={v => v && setMethod(v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="card">💳 Cartão</SelectItem>
              <SelectItem value="cash">💵 Dinheiro</SelectItem>
              <SelectItem value="pix">💸 Pix</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs">Descrição *</Label>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="ex: iFood, Freela..." className="bg-secondary border-border" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Categoria</Label>
        <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="ex: alimentação, freela..." className="bg-secondary border-border" />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={salvando}
          className={tipo === "income" ? "bg-[#10b981] hover:bg-[#10b981]/90 text-white" : "bg-[#ef4444] hover:bg-[#ef4444]/90 text-white"}
        >
          {salvando ? "Salvando..." : tipo === "income" ? "Registrar entrada" : "Registrar saída"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function FinancialManager() {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [config, setConfig] = useState<Config | null>(null)
  const [abrirEntrada, setAbrirEntrada] = useState<"income" | "expense" | null>(null)
  const [editando, setEditando] = useState<Entrada | null>(null)
  const [editandoConfig, setEditandoConfig] = useState(false)
  const [novoLimite, setNovoLimite] = useState("")

  async function carregar() {
    const [resResumo, resConfig] = await Promise.all([
      fetch("/api/financial"),
      fetch("/api/financial/config"),
    ])
    setResumo(await resResumo.json())
    setConfig(await resConfig.json())
  }

  useEffect(() => { carregar() }, [])

  async function criar(data: Record<string, unknown>) {
    const res = await fetch("/api/financial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("Erro ao registrar"); return }
    toast.success("Registrado")
    setAbrirEntrada(null)
    carregar()
  }

  async function editar(data: Record<string, unknown>) {
    if (!editando) return
    await fetch(`/api/financial/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    toast.success("Atualizado")
    setEditando(null)
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return
    await fetch(`/api/financial/${id}`, { method: "DELETE" })
    toast.success("Excluído")
    carregar()
  }

  async function salvarLimite() {
    await fetch("/api/financial/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardLimit: Number(novoLimite) }),
    })
    toast.success("Limite atualizado")
    setEditandoConfig(false)
    carregar()
  }

  if (!resumo) return <p className="text-sm text-muted-foreground">Carregando...</p>

  const gastoCartao = resumo.entradas
    .filter(e => e.type === "expense" && e.method === "card")
    .reduce((s, e) => s + e.amount, 0)
  const limiteCartao = config?.cardLimit ?? 0
  const pctCartao = limiteCartao > 0 ? gastoCartao / limiteCartao : 0
  const corBarra = pctCartao > 0.9 ? "#ef4444" : pctCartao > 0.7 ? "#f59e0b" : "#10b981"

  return (
    <div className="space-y-5">
      {/* resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4 space-y-1 col-span-2">
          <p className="text-xs text-muted-foreground">Saldo do mês</p>
          <p className={`text-2xl font-bold tabular ${resumo.saldo >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
            {fmt(resumo.saldo)}
          </p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[#10b981]">
            <TrendingUp size={13} />
            <p className="text-xs font-medium">Entradas</p>
          </div>
          <p className="text-lg font-semibold tabular text-[#10b981]">{fmt(resumo.receitas)}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[#ef4444]">
            <TrendingDown size={13} />
            <p className="text-xs font-medium">Saídas</p>
          </div>
          <p className="text-lg font-semibold tabular text-[#ef4444]">{fmt(resumo.despesas)}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-3 space-y-1 col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CreditCard size={13} />
              <p className="text-xs font-medium">Cartão</p>
            </div>
            <button onClick={() => { setNovoLimite(String(limiteCartao)); setEditandoConfig(true) }} className="text-xs text-muted-foreground hover:text-foreground">
              Editar limite
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-semibold tabular">{fmt(gastoCartao)}</p>
            {limiteCartao > 0 && (
              <p className="text-xs text-muted-foreground">/ {fmt(limiteCartao)}</p>
            )}
          </div>
          {limiteCartao > 0 && (
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(pctCartao * 100, 100)}%`,
                  background: corBarra,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setAbrirEntrada("income")} className="bg-[#10b981] hover:bg-[#10b981]/90 text-white gap-2">
          <TrendingUp size={15} /> Entrada
        </Button>
        <Button onClick={() => setAbrirEntrada("expense")} className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white gap-2">
          <TrendingDown size={15} /> Saída
        </Button>
      </div>

      {/* lista */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {resumo.entradas.length === 0 && (
            <p className="text-sm text-muted-foreground p-4">Sem lançamentos este mês.</p>
          )}
          {resumo.entradas.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className={e.type === "income" ? "text-[#10b981]" : "text-[#ef4444]"}>
                  {e.type === "income" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm truncate">{e.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(String(e.date).slice(0, 10) + "T12:00:00.000Z"), "dd/MM", { locale: ptBR })}
                    {e.category ? ` · ${e.category}` : ""}
                    {e.type === "expense" && e.method ? ` · ${METHOD_LABELS[e.method] ?? e.method}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-semibold tabular ${e.type === "income" ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                  {e.type === "income" ? "+" : "-"}{fmt(e.amount)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditando(e)}>
                  <Pencil size={12} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => excluir(e.id)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* dialog nova entrada/saída */}
      <Dialog open={!!abrirEntrada} onOpenChange={v => !v && setAbrirEntrada(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{abrirEntrada === "income" ? "Nova entrada" : "Nova saída"}</DialogTitle>
          </DialogHeader>
          {abrirEntrada && <EntradaForm tipo={abrirEntrada} onSalvar={criar} />}
        </DialogContent>
      </Dialog>

      {/* dialog editar */}
      <Dialog open={!!editando} onOpenChange={v => !v && setEditando(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar lançamento</DialogTitle></DialogHeader>
          {editando && <EntradaForm tipo={editando.type as "income" | "expense"} inicial={editando} onSalvar={editar} />}
        </DialogContent>
      </Dialog>

      {/* dialog limite cartão */}
      <Dialog open={editandoConfig} onOpenChange={setEditandoConfig}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Limite do cartão</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="number" step="0.01" value={novoLimite} onChange={e => setNovoLimite(e.target.value)} placeholder="ex: 2000" className="bg-secondary border-border" />
            <DialogFooter>
              <Button onClick={salvarLimite} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
