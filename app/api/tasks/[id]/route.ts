import { NextResponse } from "next/server"
import { atualizarTarefa, deletarTarefa } from "@/lib/db/tasks"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const tarefa = await atualizarTarefa(id, body)
  return NextResponse.json(tarefa)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  await deletarTarefa(id)
  return NextResponse.json({ ok: true })
}
