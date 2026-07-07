import { NextRequest, NextResponse } from "next/server"
import { criarMedidaJulia } from "@/lib/db/desafio"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data: dataParam, peso, massaMuscular, gorduraSubcutanea, fonte, notas } = body
  if (!dataParam || !peso || !fonte) {
    return NextResponse.json({ error: "data, peso e fonte são obrigatórios" }, { status: 400 })
  }
  const medida = await criarMedidaJulia({
    data: new Date(dataParam),
    peso: Number(peso),
    massaMuscular: massaMuscular ? Number(massaMuscular) : undefined,
    gorduraSubcutanea: gorduraSubcutanea ? Number(gorduraSubcutanea) : undefined,
    fonte,
    notas,
  })
  return NextResponse.json(medida, { status: 201 })
}
