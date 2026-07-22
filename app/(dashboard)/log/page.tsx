export const dynamic = "force-dynamic"

import { DailyLogManager } from "@/components/log/DailyLogManager"

export default function LogPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Registro Diário</h1>
      <DailyLogManager />
    </div>
  )
}
