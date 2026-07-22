import { NextRequest, NextResponse } from "next/server"
import { criarNota } from "@/lib/db/graduation"

export async function POST(req: NextRequest) {
  const { name, weight, disciplineId } = await req.json()
  if (!name?.trim() || !disciplineId) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
  }
  const n = await criarNota({ name: name.trim(), weight: Number(weight ?? 1), disciplineId })
  return NextResponse.json(n, { status: 201 })
}
