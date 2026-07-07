import { NextResponse } from "next/server"
import { dadosDesafio } from "@/lib/db/desafio"

export async function GET() {
  const dados = await dadosDesafio()
  return NextResponse.json(dados)
}
