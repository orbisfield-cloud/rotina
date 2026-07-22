"use client"

interface Props {
  onSelect: (dayType: "good" | "bad") => Promise<void>
}

export function DayTypeModal({ onSelect }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Como está o dia?</p>
        <p className="text-sm text-muted-foreground">Isso define quais tarefas vão aparecer</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <button
          onClick={() => onSelect("good")}
          className="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-border p-8 text-center transition-colors hover:border-[#10b981] hover:bg-[#10b981]/5 active:scale-95"
        >
          <span className="text-4xl">☀️</span>
          <div>
            <p className="font-semibold text-foreground">Dia bom</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tarefas de alto esforço</p>
          </div>
        </button>
        <button
          onClick={() => onSelect("bad")}
          className="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-border p-8 text-center transition-colors hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5 active:scale-95"
        >
          <span className="text-4xl">🌧️</span>
          <div>
            <p className="font-semibold text-foreground">Dia ruim</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tarefas de baixo esforço</p>
          </div>
        </button>
      </div>
    </div>
  )
}
