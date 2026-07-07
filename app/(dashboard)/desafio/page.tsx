export const dynamic = "force-dynamic"

import { DesafioManager } from "@/components/desafio/DesafioManager"

export default function DesafioPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Desafio — vs Julia</h1>
      <DesafioManager />
    </div>
  )
}
