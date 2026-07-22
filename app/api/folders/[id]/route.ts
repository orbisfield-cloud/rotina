import { NextResponse } from "next/server"
import { atualizarPasta, deletarPasta } from "@/lib/db/systems"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const pasta = await atualizarPasta(id, body)
  return NextResponse.json(pasta)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  await deletarPasta(id)
  return NextResponse.json({ ok: true })
}
