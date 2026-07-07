import { NextRequest, NextResponse } from "next/server"
import { listarSuplementos, criarSuplemento } from "@/lib/db/suplementos"

export async function GET(req: NextRequest) {
  const apenasAtivos = req.nextUrl.searchParams.get("ativos") === "true"
  const suplementos = await listarSuplementos(apenasAtivos)
  return NextResponse.json(suplementos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome, dose, horario, notas } = body
  if (!nome || !dose || !horario) {
    return NextResponse.json({ error: "nome, dose e horario são obrigatórios" }, { status: 400 })
  }
  const suplemento = await criarSuplemento({ nome, dose, horario, notas })
  return NextResponse.json(suplemento, { status: 201 })
}
