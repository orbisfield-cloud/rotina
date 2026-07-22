export const dynamic = "force-dynamic"

import Link from "next/link"
import { listarSistemas } from "@/lib/db/systems"
import { ChevronRight, Plus } from "lucide-react"

export default async function SystemsPage() {
  const sistemas = await listarSistemas()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sistemas</h1>
      </div>

      <div className="space-y-2">
        {sistemas.map((s) => (
          <Link
            key={s.id}
            href={`/systems/${s.id}`}
            className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-border/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${s.color}22` }}
              >
                {s.icon}
              </span>
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s._count.tasks} tarefa{s._count.tasks !== 1 ? "s" : ""} pendente{s._count.tasks !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}
