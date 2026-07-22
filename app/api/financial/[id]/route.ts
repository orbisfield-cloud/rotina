import { NextResponse } from "next/server"
import { atualizarEntrada, deletarEntrada } from "@/lib/db/financial"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const entrada = await atualizarEntrada(id, body)
  return NextResponse.json(entrada)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  await deletarEntrada(id)
  return NextResponse.json({ ok: true })
}
