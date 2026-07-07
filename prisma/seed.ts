import "dotenv/config"
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.suplemento.deleteMany()
  await prisma.medidaCorporal.deleteMany()

  await prisma.suplemento.createMany({
    data: [
      { nome: "Whey Protein", dose: "30g", horario: "manha", notas: "Primeira dose do dia" },
      { nome: "Whey Protein", dose: "30g", horario: "pos-treino", notas: "Imediatamente após o treino" },
      { nome: "Creatina", dose: "5g", horario: "manha", notas: "Pode misturar com qualquer líquido" },
      { nome: "Nuture", dose: "1 dose", horario: "manha", notas: null },
      { nome: "Brainjuice", dose: "1 dose", horario: "manha", ativo: false, notas: "Ativar quando necessário" },
      { nome: "Venvanse", dose: "conforme prescrito", horario: "manha", ativo: false, notas: "Adicionar em ~30 dias" },
    ],
  })

  const baseline = new Date("2026-07-07")

  await prisma.medidaCorporal.createMany({
    data: [
      {
        data: baseline,
        peso: 93.1,
        massaMuscular: 50.9,
        gorduraSubcutanea: 8.6,
        fonte: "bioimpedancia",
        pessoa: "filipe",
        notas: "Baseline — início do desafio",
      },
      {
        data: baseline,
        peso: 76.15,
        massaMuscular: 38.3,
        gorduraSubcutanea: 18.5,
        fonte: "bioimpedancia",
        pessoa: "julia",
        notas: "Baseline — início do desafio",
      },
    ],
  })

  console.log("Seed concluído.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
