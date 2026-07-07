import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  accent?: "green" | "purple" | "yellow" | "red" | "default"
}

const accentClasses = {
  green: "text-[#10b981]",
  purple: "text-[#8b5cf6]",
  yellow: "text-[#f59e0b]",
  red: "text-[#ef4444]",
  default: "text-foreground",
}

export function StatCard({ title, value, sub, icon: Icon, accent = "default" }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon size={16} className="text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <p className={cn("text-3xl font-bold tabular", accentClasses[accent])}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
