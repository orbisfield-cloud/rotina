import { NextRequest, NextResponse } from "next/server"
import { atualizarTreino, deletarTreino } from "@/lib/db/treino"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const treino = await atualizarTreino(Number(id), {
    ...body,
    data: body.data ? new Date(body.data) : undefined,
    duracao: body.duracao ? Number(body.duracao) : undefined,
    intensidade: body.intensidade ? Number(body.intensidade) : undefined,
  })
  return NextResponse.json(treino)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await deletarTreino(Number(id))
  return new NextResponse(null, { status: 204 })
}
