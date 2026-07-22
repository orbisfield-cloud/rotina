import { NextResponse } from "next/server"
import { resumoMes, criarEntrada } from "@/lib/db/financial"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mes = url.searchParams.get("mes") ? Number(url.searchParams.get("mes")) : undefined
  const ano = url.searchParams.get("ano") ? Number(url.searchParams.get("ano")) : undefined
  const resumo = await resumoMes(mes, ano)
  return NextResponse.json(resumo)
}

export async function POST(req: Request) {
  const body = await req.json()
  const entrada = await criarEntrada(body)
  return NextResponse.json(entrada, { status: 201 })
}
