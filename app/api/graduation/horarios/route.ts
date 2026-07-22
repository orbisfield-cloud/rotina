import { NextRequest, NextResponse } from "next/server"
import { criarHorario } from "@/lib/db/graduation"

export async function POST(req: NextRequest) {
  const { disciplineId, dayOfWeek, startTime, endTime } = await req.json()
  if (!disciplineId || !dayOfWeek || !startTime || !endTime) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
  }
  const h = await criarHorario({ disciplineId, dayOfWeek: Number(dayOfWeek), startTime, endTime })
  return NextResponse.json(h, { status: 201 })
}
