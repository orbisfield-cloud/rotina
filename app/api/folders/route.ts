import { NextResponse } from "next/server"
import { criarPasta } from "@/lib/db/systems"

export async function POST(req: Request) {
  const body = await req.json()
  const pasta = await criarPasta(body)
  return NextResponse.json(pasta, { status: 201 })
}
