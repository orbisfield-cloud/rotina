import { NextRequest, NextResponse } from "next/server"
import { atualizarFaltas } from "@/lib/db/graduation"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { delta } = await req.json()
  const d = await atualizarFaltas(id, delta)
  return NextResponse.json(d)
}
