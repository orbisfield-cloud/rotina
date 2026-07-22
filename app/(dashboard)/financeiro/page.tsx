export const dynamic = "force-dynamic"

import { FinancialManager } from "@/components/financial/FinancialManager"

export default function FinanceiroPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Financeiro</h1>
      <FinancialManager />
    </div>
  )
}
