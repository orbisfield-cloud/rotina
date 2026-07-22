import { NextResponse } from "next/server"
import { listarSistemas, criarSistema } from "@/lib/db/systems"

export async function GET() {
  const sistemas = await listarSistemas()
  return NextResponse.json(sistemas)
}

export async function POST(req: Request) {
  const body = await req.json()
  const sistema = await criarSistema(body)
  return NextResponse.json(sistema, { status: 201 })
}
