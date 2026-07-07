export const dynamic = "force-dynamic"

import { PesoManager } from "@/components/peso/PesoManager"

export default function PesoPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Peso e composição corporal</h1>
      <PesoManager />
    </div>
  )
}
