import { NextResponse } from "next/server"
import { criarTarefa } from "@/lib/db/tasks"

export async function POST(req: Request) {
  const body = await req.json()
  const tarefa = await criarTarefa(body)
  return NextResponse.json(tarefa, { status: 201 })
}
