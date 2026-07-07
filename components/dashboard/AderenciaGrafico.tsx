"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DiaAderencia {
  data: string
  tomados: number
  total: number
}

export function AderenciaGrafico({ dados }: { dados: DiaAderencia[] }) {
  const formatados = dados.map((d) => ({
    ...d,
    dataLabel: format(new Date(d.data), "dd/MM", { locale: ptBR }),
    pct: d.total > 0 ? Math.round((d.tomados / d.total) * 100) : 0,
  }))

  return (
    <Card className="bg-card border-border col-span-full md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Aderência suplementos (14 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={formatados} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252932" />
            <XAxis dataKey="dataLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ background: "#1a1d26", border: "1px solid #252932", borderRadius: 8 }}
              labelStyle={{ color: "#f1f5f9" }}
              itemStyle={{ color: "#8b5cf6" }}
              formatter={(v) => [`${Number(v)}%`, "Aderência"]}
            />
            <Bar dataKey="pct" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="%" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
