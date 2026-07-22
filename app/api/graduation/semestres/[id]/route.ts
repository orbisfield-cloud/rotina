import { NextRequest, NextResponse } from "next/server"
import { ativarSemestre } from "@/lib/db/graduation"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sem = await ativarSemestre(id)
  return NextResponse.json(sem)
}
