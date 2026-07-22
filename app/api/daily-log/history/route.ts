import { NextResponse } from "next/server"
import { historicoLog } from "@/lib/db/daily-log"

export async function GET() {
  const historico = await historicoLog(14)
  return NextResponse.json(historico)
}
