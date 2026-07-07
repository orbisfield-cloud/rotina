"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Ponto {
  data: string | Date
  peso: number
  massaMuscular?: number | null
}

export function PesoGraficoDashboard({ dados }: { dados: Ponto[] }) {
  const formatados = dados.map((d) => ({
    ...d,
    dataLabel: format(new Date(d.data), "dd/MM", { locale: ptBR }),
  }))

  return (
    <Card className="bg-card border-border col-span-full md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Peso (últimos 60 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={formatados} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252932" />
            <XAxis dataKey="dataLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#1a1d26", border: "1px solid #252932", borderRadius: 8 }}
              labelStyle={{ color: "#f1f5f9" }}
              itemStyle={{ color: "#10b981" }}
            />
            <Line
              type="monotone"
              dataKey="peso"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Peso (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
