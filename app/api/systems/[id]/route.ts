import { NextResponse } from "next/server"
import { obterSistema, atualizarSistema, deletarSistema } from "@/lib/db/systems"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const sistema = await obterSistema(id)
  if (!sistema) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(sistema)
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const sistema = await atualizarSistema(id, body)
  return NextResponse.json(sistema)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    await deletarSistema(id)
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
