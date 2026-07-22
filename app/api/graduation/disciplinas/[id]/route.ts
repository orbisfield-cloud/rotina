import { NextRequest, NextResponse } from "next/server"
import { obterDisciplina, atualizarDisciplina, deletarDisciplina } from "@/lib/db/graduation"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = await obterDisciplina(id)
  if (!d) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(d)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const d = await atualizarDisciplina(id, data)
  return NextResponse.json(d)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deletarDisciplina(id)
  return NextResponse.json({ ok: true })
}
