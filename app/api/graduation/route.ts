import { NextResponse } from "next/server"
import { listarSemestres, semestreAtivo } from "@/lib/db/graduation"

export const dynamic = "force-dynamic"

export async function GET() {
  const [semestres, ativo] = await Promise.all([listarSemestres(), semestreAtivo()])
  return NextResponse.json({ semestres, semestreAtivo: ativo })
}
