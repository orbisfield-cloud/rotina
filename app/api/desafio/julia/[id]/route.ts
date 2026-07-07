import { NextRequest, NextResponse } from "next/server"
import { atualizarMedidaJulia, deletarMedidaJulia } from "@/lib/db/desafio"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const medida = await atualizarMedidaJulia(Number(id), {
    ...body,
    data: body.data ? new Date(body.data) : undefined,
    peso: body.peso ? Number(body.peso) : undefined,
    massaMuscular: body.massaMuscular ? Number(body.massaMuscular) : undefined,
    gorduraSubcutanea: body.gorduraSubcutanea ? Number(body.gorduraSubcutanea) : undefined,
  })
  return NextResponse.json(medida)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await deletarMedidaJulia(Number(id))
  return new NextResponse(null, { status: 204 })
}
