"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pencil, Trash2, TrendingUp, TrendingDown, CreditCard, Tags, Check, X } from "lucide-react"
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

interface Categoria {
  id: string
  name: string
  icon: string | null
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
  categorias,
  onSalvar,
}: {
  tipo: "income" | "expense"
  inicial?: Entrada
  categorias: Categoria[]
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
        <Select value={category} onValueChange={v => v != null && setCategory(v === "_none" ? "" : v)}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Sem categoria" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="_none">Sem categoria</SelectItem>
            {categorias.map(c => (
              <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [abrirEntrada, setAbrirEntrada] = useState<"income" | "expense" | null>(null)
  const [editando, setEditando] = useState<Entrada | null>(null)
  const [editandoConfig, setEditandoConfig] = useState(false)
  const [novoLimite, setNovoLimite] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("_all")
  const [gerenciarCats, setGerenciarCats] = useState(false)
  const [novaCatNome, setNovaCatNome] = useState("")
  const [novaCatIcon, setNovaCatIcon] = useState("")
  const [editandoCatId, setEditandoCatId] = useState<string | null>(null)
  const [editandoCatNome, setEditandoCatNome] = useState("")

  async function carregar() {
    const [resResumo, resConfig, resCats] = await Promise.all([
      fetch("/api/financial"),
      fetch("/api/financial/config"),
      fetch("/api/financial/categorias"),
    ])
    setResumo(await resResumo.json())
    setConfig(await resConfig.json())
    setCategorias(await resCats.json())
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

  async function adicionarCategoria() {
    if (!novaCatNome.trim()) return
    await fetch("/api/financial/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: novaCatNome.trim(), icon: novaCatIcon.trim() || null }),
    })
    setNovaCatNome("")
    setNovaCatIcon("")
    carregar()
  }

  async function renomearCategoria(id: string) {
    if (!editandoCatNome.trim()) return
    await fetch(`/api/financial/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editandoCatNome.trim() }),
    })
    setEditandoCatId(null)
    carregar()
  }

  async function excluirCategoria(id: string) {
    await fetch(`/api/financial/categorias/${id}`, { method: "DELETE" })
    carregar()
  }

  if (!resumo) return <p className="text-sm text-muted-foreground">Carregando...</p>

  const gastoCartao = resumo.entradas
    .filter(e => e.type === "expense" && e.method === "card")
    .reduce((s, e) => s + e.amount, 0)
  const limiteCartao = config?.cardLimit ?? 0
  const pctCartao = limiteCartao > 0 ? gastoCartao / limiteCartao : 0
  const corBarra = pctCartao > 0.9 ? "#ef4444" : pctCartao > 0.7 ? "#f59e0b" : "#10b981"

  // Resumo por categoria (despesas)
  const gastoPorCat = resumo.entradas
    .filter(e => e.type === "expense")
    .reduce<Record<string, number>>((acc, e) => {
      const cat = e.category || "Sem categoria"
      acc[cat] = (acc[cat] || 0) + e.amount
      return acc
    }, {})
  const resumoCats = Object.entries(gastoPorCat).sort(([, a], [, b]) => b - a)

  // Entradas filtradas para a lista
  const entradasFiltradas = filtroCategoria === "_all"
    ? resumo.entradas
    : resumo.entradas.filter(e => (e.category || "") === (filtroCategoria === "_none" ? "" : filtroCategoria))

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
            {limiteCartao > 0 && <p className="text-xs text-muted-foreground">/ {fmt(limiteCartao)}</p>}
          </div>
          {limiteCartao > 0 && (
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pctCartao * 100, 100)}%`, background: corBarra }} />
            </div>
          )}
        </div>
      </div>

      {/* resumo por categoria */}
      {resumoCats.length > 0 && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 pt-3 pb-2">
            Gastos por categoria
          </p>
          <div className="divide-y divide-border">
            {resumoCats.map(([cat, total]) => {
              const catObj = categorias.find(c => c.name === cat)
              return (
                <div key={cat} className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm">{catObj?.icon ? `${catObj.icon} ` : ""}{cat}</span>
                  <span className="text-sm font-medium tabular text-[#ef4444]">{fmt(total)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setAbrirEntrada("income")} className="bg-[#10b981] hover:bg-[#10b981]/90 text-white gap-2">
          <TrendingUp size={15} /> Entrada
        </Button>
        <Button onClick={() => setAbrirEntrada("expense")} className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white gap-2">
          <TrendingDown size={15} /> Saída
        </Button>
      </div>

      {/* filtro + gerenciar */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={filtroCategoria} onValueChange={v => v != null && setFiltroCategoria(v)}>
            <SelectTrigger className="bg-secondary border-border text-sm">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="_all">Todas</SelectItem>
              <SelectItem value="_none">Sem categoria</SelectItem>
              {categorias.map(c => (
                <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" onClick={() => setGerenciarCats(true)}>
          <Tags size={16} />
        </Button>
      </div>

      {/* lista */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {entradasFiltradas.length === 0 && (
            <p className="text-sm text-muted-foreground p-4">Sem lançamentos.</p>
          )}
          {entradasFiltradas.map((e) => (
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
          {abrirEntrada && <EntradaForm tipo={abrirEntrada} categorias={categorias} onSalvar={criar} />}
        </DialogContent>
      </Dialog>

      {/* dialog editar */}
      <Dialog open={!!editando} onOpenChange={v => !v && setEditando(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar lançamento</DialogTitle></DialogHeader>
          {editando && <EntradaForm tipo={editando.type as "income" | "expense"} inicial={editando} categorias={categorias} onSalvar={editar} />}
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

      {/* dialog gerenciar categorias */}
      <Dialog open={gerenciarCats} onOpenChange={setGerenciarCats}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Categorias</DialogTitle></DialogHeader>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {categorias.map(c => (
              <div key={c.id} className="flex items-center gap-2 py-1.5">
                {editandoCatId === c.id ? (
                  <>
                    <Input
                      value={editandoCatNome}
                      onChange={e => setEditandoCatNome(e.target.value)}
                      className="bg-secondary border-border h-8 text-sm flex-1"
                      autoFocus
                    />
                    <button onClick={() => renomearCategoria(c.id)} className="text-[#10b981] hover:opacity-80"><Check size={14} /></button>
                    <button onClick={() => setEditandoCatId(null)} className="text-muted-foreground hover:opacity-80"><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{c.icon} {c.name}</span>
                    <button onClick={() => { setEditandoCatId(c.id); setEditandoCatNome(c.name) }} className="text-muted-foreground hover:text-foreground"><Pencil size={13} /></button>
                    <button onClick={() => excluirCategoria(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Nova categoria</p>
            <div className="flex gap-2">
              <Input value={novaCatIcon} onChange={e => setNovaCatIcon(e.target.value)} placeholder="🏷️" className="bg-secondary border-border w-16 text-center" maxLength={2} />
              <Input value={novaCatNome} onChange={e => setNovaCatNome(e.target.value)} placeholder="Nome" className="bg-secondary border-border flex-1" />
              <Button onClick={adicionarCategoria} size="sm" className="bg-primary text-primary-foreground">+</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
