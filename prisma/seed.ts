import "dotenv/config"
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const totalSuplementos = await prisma.suplemento.count()
  if (totalSuplementos === 0) {
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
    console.log("Suplementos criados.")
  }

  const totalMedidas = await prisma.medidaCorporal.count()
  if (totalMedidas === 0) {
    const baseline = new Date("2026-07-07")
    await prisma.medidaCorporal.createMany({
      data: [
        { data: baseline, peso: 93.1, massaMuscular: 50.9, gorduraSubcutanea: 8.6, fonte: "bioimpedancia", pessoa: "filipe", notas: "Baseline — início do desafio" },
        { data: baseline, peso: 76.15, massaMuscular: 38.3, gorduraSubcutanea: 18.5, fonte: "bioimpedancia", pessoa: "julia", notas: "Baseline — início do desafio" },
      ],
    })
    console.log("Medidas baseline criadas.")
  }

  const totalSistemas = await prisma.system.count()
  if (totalSistemas === 0) {
    await prisma.system.createMany({
      data: [
        { name: "TDAH",       icon: "⚡", color: "#8B5CF6", order: 0, isDefault: true },
        { name: "Graduação",  icon: "🎓", color: "#3B82F6", order: 1, isDefault: true },
        { name: "República",  icon: "🏠", color: "#10B981", order: 2, isDefault: true },
        { name: "gMAP",       icon: "🗺️", color: "#F59E0B", order: 3, isDefault: true },
        { name: "Financeiro", icon: "💰", color: "#059669", order: 4, isDefault: true },
        { name: "Pessoal",    icon: "🙋", color: "#EC4899", order: 5, isDefault: true },
      ],
    })
    console.log("Sistemas ACP criados.")
  }

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
