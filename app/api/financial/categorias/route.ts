import { NextResponse } from "next/server"
import { listarCategorias, criarCategoria } from "@/lib/db/financial"

export async function GET() {
  return NextResponse.json(await listarCategorias())
}

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json(await criarCategoria(body))
}
