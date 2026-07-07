import { NextRequest, NextResponse } from "next/server"
import { listarMedidas, criarMedida } from "@/lib/db/peso"

export async function GET() {
  const medidas = await listarMedidas("filipe")
  return NextResponse.json(medidas)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data: dataParam, peso, massaMuscular, gorduraSubcutanea, fonte, notas } = body
  if (!dataParam || !peso || !fonte) {
    return NextResponse.json({ error: "data, peso e fonte são obrigatórios" }, { status: 400 })
  }
  const medida = await criarMedida({
    data: new Date(dataParam),
    peso: Number(peso),
    massaMuscular: massaMuscular ? Number(massaMuscular) : undefined,
    gorduraSubcutanea: gorduraSubcutanea ? Number(gorduraSubcutanea) : undefined,
    fonte,
    notas,
    pessoa: "filipe",
  })
  return NextResponse.json(medida, { status: 201 })
}
