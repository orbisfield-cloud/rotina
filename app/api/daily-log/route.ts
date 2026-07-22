import { NextResponse } from "next/server"
import { logDeHoje, definirTipoDia, atualizarLogNoite } from "@/lib/db/daily-log"

export async function GET() {
  const log = await logDeHoje()
  return NextResponse.json(log)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (body.dayType) {
    const log = await definirTipoDia(body.dayType)
    return NextResponse.json(log)
  }
  if (body.id) {
    const { id, ...data } = body
    const log = await atualizarLogNoite(id, data)
    return NextResponse.json(log)
  }
  return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
}
