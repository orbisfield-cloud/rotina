"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"

interface Suplemento {
  id: number
  nome: string
  dose: string
  horario: string
  notas: string | null
  registro: { id: number; tomado: boolean } | null
}

const HORARIO_LABEL: Record<string, string> = {
  manha: "Manhã",
  almoco: "Almoço",
  tarde: "Tarde",
  noite: "Noite",
  "pos-treino": "Pós-treino",
}

export function RegistroDiario() {
  const [data, setData] = useState<Date>(new Date())
  const [suplementos, setSuplementos] = useState<Suplemento[]>([])
  const [carregando, setCarregando] = useState(true)

  async function carregar(d: Date) {
    setCarregando(true)
    const iso = format(d, "yyyy-MM-dd")
    const res = await fetch(`/api/suplementos/registros?data=${iso}`)
    const dados = await res.json()
    setSuplementos(dados)
    setCarregando(false)
  }

  useEffect(() => {
    carregar(data)
  }, [data])

  async function toggle(suplementoId: number, tomado: boolean) {
    const iso = format(data, "yyyy-MM-dd")
    const res = await fetch("/api/suplementos/registros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suplementoId, data: iso, tomado }),
    })
    if (!res.ok) { toast.error("Erro ao salvar"); return }
    setSuplementos((prev) =>
      prev.map((s) =>
        s.id === suplementoId ? { ...s, registro: { id: 0, tomado } } : s
      )
    )
  }

  const porHorario = suplementos.reduce<Record<string, Suplemento[]>>((acc, s) => {
    const h = s.horario
    if (!acc[h]) acc[h] = []
    acc[h].push(s)
    return acc
  }, {})

  const tomados = suplementos.filter((s) => s.registro?.tomado).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" className="gap-2 border-border bg-card text-foreground" />}>
            <CalendarIcon size={14} />
            {format(data, "dd/MM/yyyy", { locale: ptBR })}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border">
            <Calendar
              mode="single"
              selected={data}
              onSelect={(d) => d && setData(d)}
              className="text-foreground"
            />
          </PopoverContent>
        </Popover>
        <span className="text-sm text-muted-foreground">
          {tomados}/{suplementos.length} tomados
        </span>
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        Object.entries(porHorario).map(([horario, itens]) => (
          <div key={horario}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {HORARIO_LABEL[horario] ?? horario}
            </p>
            <div className="space-y-2">
              {itens.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <Checkbox
                    checked={s.registro?.tomado ?? false}
                    onCheckedChange={(v) => toggle(s.id, Boolean(v))}
                  />
                  <div>
                    <p className="text-sm font-medium">{s.nome}</p>
                    <p className="text-xs text-muted-foreground">{s.dose}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
