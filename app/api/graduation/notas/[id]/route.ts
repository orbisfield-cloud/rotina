import { NextRequest, NextResponse } from "next/server"
import { atualizarNota, deletarNota } from "@/lib/db/graduation"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const n = await atualizarNota(id, data)
  return NextResponse.json(n)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deletarNota(id)
  return NextResponse.json({ ok: true })
}
