import { NextResponse } from "next/server"
import { obterConfig, atualizarConfig } from "@/lib/db/financial"

export async function GET() {
  const config = await obterConfig()
  return NextResponse.json(config)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const config = await atualizarConfig(body)
  return NextResponse.json(config)
}
