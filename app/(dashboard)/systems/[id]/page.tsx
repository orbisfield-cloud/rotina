export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { obterSistema } from "@/lib/db/systems"
import { SystemDetail } from "@/components/systems/SystemDetail"
import { ChevronLeft } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

export default async function SystemPage({ params }: Props) {
  const { id } = await params
  const sistema = await obterSistema(id)
  if (!sistema) notFound()

  const totalPendentes = sistema.tasks.length + sistema.folders.reduce((s, f) => s + f.tasks.length, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/systems" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: `${sistema.color}22` }}
          >
            {sistema.icon}
          </span>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{sistema.name}</h1>
            <p className="text-xs text-muted-foreground">{totalPendentes} pendente{totalPendentes !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <SystemDetail sistemaInicial={sistema} />
    </div>
  )
}
