export const dynamic = "force-dynamic"

import { TreinoManager } from "@/components/treino/TreinoManager"

export default function TreinoPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Treino</h1>
      <TreinoManager />
    </div>
  )
}
