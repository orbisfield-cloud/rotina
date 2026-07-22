import { evaluate } from "mathjs"

interface GradeItem {
  name: string
  value: number | null
  weight: number
}

export function calcularMedia(grades: GradeItem[], formula: string | null): number | null {
  if (grades.length === 0) return null

  if (formula && formula.trim()) {
    const scope: Record<string, number> = {}
    for (const g of grades) {
      if (g.value !== null) scope[g.name] = g.value
    }
    try {
      const result = evaluate(formula.trim(), scope)
      const n = Number(result)
      return isFinite(n) ? n : null
    } catch {
      return null
    }
  }

  const filled = grades.filter(g => g.value !== null)
  if (filled.length === 0) return null
  const sumPesos = filled.reduce((s, g) => s + g.weight, 0)
  if (sumPesos === 0) return null
  return filled.reduce((s, g) => s + g.value! * g.weight, 0) / sumPesos
}

export function maxFaltas(totalClasses: number) {
  return Math.floor(totalClasses * 0.3)
}

export function corBarraFaltas(atual: number, max: number): string {
  if (max === 0) return "#10b981"
  const pct = atual / max
  if (pct >= 0.75) return "#ef4444"
  if (pct >= 0.5) return "#f59e0b"
  return "#10b981"
}

export const STATUS_LABELS: Record<string, string> = {
  in_progress: "Em andamento",
  approved: "Aprovado",
  failed: "Reprovado",
  recovery: "Recuperação",
}

export const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-secondary text-muted-foreground",
  approved: "bg-[#10b981]/15 text-[#10b981]",
  failed: "bg-[#ef4444]/15 text-[#ef4444]",
  recovery: "bg-[#f59e0b]/15 text-[#f59e0b]",
}

export const DIAS_SEMANA: Record<number, string> = {
  1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta",
}
