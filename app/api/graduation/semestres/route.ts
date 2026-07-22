import { NextRequest, NextResponse } from "next/server"
import { criarSemestre } from "@/lib/db/graduation"

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
  const sem = await criarSemestre(name.trim())
  return NextResponse.json(sem, { status: 201 })
}
