import { NextRequest, NextResponse } from "next/server"
import { atualizarSuplemento, deletarSuplemento } from "@/lib/db/suplementos"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const suplemento = await atualizarSuplemento(Number(id), body)
  return NextResponse.json(suplemento)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await deletarSuplemento(Number(id))
  return new NextResponse(null, { status: 204 })
}
