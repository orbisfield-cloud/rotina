import { NextRequest, NextResponse } from "next/server"
import { criarDisciplina } from "@/lib/db/graduation"

export async function POST(req: NextRequest) {
  const { name, code, semesterId, totalClasses } = await req.json()
  if (!name?.trim() || !semesterId || !totalClasses) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
  }
  const d = await criarDisciplina({ name: name.trim(), code: code || null, semesterId, totalClasses: Number(totalClasses) })
  return NextResponse.json(d, { status: 201 })
}
