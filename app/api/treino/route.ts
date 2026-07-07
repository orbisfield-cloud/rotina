import { NextRequest, NextResponse } from "next/server"
import { listarTreinos, criarTreino } from "@/lib/db/treino"

export async function GET() {
  const treinos = await listarTreinos(30)
  return NextResponse.json(treinos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data: dataParam, tipo, duracao, intensidade, notas } = body
  if (!dataParam || !tipo || !duracao) {
    return NextResponse.json({ error: "data, tipo e duracao são obrigatórios" }, { status: 400 })
  }
  const treino = await criarTreino({
    data: new Date(dataParam),
    tipo,
    duracao: Number(duracao),
    intensidade: intensidade ? Number(intensidade) : undefined,
    notas,
  })
  return NextResponse.json(treino, { status: 201 })
}
