import { NextResponse } from "next/server"
import { resumoHoje, aderenciaSemana } from "@/lib/db/suplementos"
import { ultimoTreino, resumoSemanal } from "@/lib/db/treino"
import { pesoAtual, historicoPeso } from "@/lib/db/peso"
import { dadosDesafio } from "@/lib/db/desafio"

export async function GET() {
  const [suplementosHoje, aderencia, ultimo, semanal, peso, historico, desafio] = await Promise.all([
    resumoHoje(),
    aderenciaSemana(14),
    ultimoTreino(),
    resumoSemanal(),
    pesoAtual(),
    historicoPeso(60),
    dadosDesafio(),
  ])

  return NextResponse.json({
    suplementosHoje,
    aderencia,
    ultimoTreino: ultimo,
    resumoSemanal: semanal,
    pesoAtual: peso,
    historicoPeso: historico,
    desafio,
  })
}
