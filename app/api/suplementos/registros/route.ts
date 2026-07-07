import { NextRequest, NextResponse } from "next/server"
import { listarRegistrosDoDia, toggleRegistro } from "@/lib/db/suplementos"

export async function GET(req: NextRequest) {
  const dataParam = req.nextUrl.searchParams.get("data")
  const data = dataParam ? new Date(dataParam) : new Date()
  data.setHours(0, 0, 0, 0)
  const registros = await listarRegistrosDoDia(data)
  return NextResponse.json(registros)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { suplementoId, data: dataParam, tomado } = body
  if (!suplementoId || !dataParam) {
    return NextResponse.json({ error: "suplementoId e data são obrigatórios" }, { status: 400 })
  }
  const data = new Date(dataParam)
  data.setHours(0, 0, 0, 0)
  const registro = await toggleRegistro(Number(suplementoId), data, Boolean(tomado))
  return NextResponse.json(registro)
}
