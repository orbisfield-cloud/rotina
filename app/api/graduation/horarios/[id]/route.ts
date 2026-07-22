import { NextRequest, NextResponse } from "next/server"
import { deletarHorario } from "@/lib/db/graduation"

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deletarHorario(id)
  return NextResponse.json({ ok: true })
}
