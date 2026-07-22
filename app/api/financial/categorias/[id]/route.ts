import { NextResponse } from "next/server"
import { atualizarCategoria, deletarCategoria } from "@/lib/db/financial"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  return NextResponse.json(await atualizarCategoria(id, body))
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  await deletarCategoria(id)
  return NextResponse.json({ ok: true })
}
