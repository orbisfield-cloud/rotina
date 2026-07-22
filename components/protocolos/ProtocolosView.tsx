"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface Protocolo {
  id: string
  titulo: string
  quandoUsar: string
  box: string
  porque: string
}

const PROTOCOLOS: Protocolo[] = [
  {
    id: "P-EST",
    titulo: "Estudo de assunto novo",
    quandoUsar: "Qualquer disciplina, tecnologia ou domínio novo.",
    box: `┌─ P-EST: ESTUDO DE ASSUNTO NOVO ─────────┐
│                                          │
│ 1. Definir o tipo de estudo:             │
│    ☐ Compreensão (sem prazo)             │
│    ☐ Prova (com prazo)                   │
│                                          │
│ 2. SE compreensão:                       │
│    ☐ Qual mecanismo gera este assunto?   │
│    ☐ Quais são as variáveis?             │
│    ☐ Como as variáveis interagem?        │
│    ☐ O que acontece se alterar cada uma? │
│    ☐ Construir modelo mínimo             │
│    ☐ Simular mentalmente                 │
│    ☐ Só então memorizar detalhes         │
│                                          │
│ 3. SE prova:                             │
│    ☐ Listar o que a prova cobra          │
│    ☐ Subir a árvore de dependência       │
│      SÓ até onde o prazo permite         │
│    ☐ Conteúdo arbitrário → ferramenta    │
│      externa (Anki), não teoria          │
│    ☐ Resolver questões antigas ANTES     │
│      de se sentir pronto                 │
│                                          │
│ 4. Ao travar (>30 min sem progresso):    │
│    ☐ Explicar o assunto em voz alta      │
│      como se ensinasse (E-08)            │
└──────────────────────────────────────────┘`,
    porque: "A distinção compreensão/prova existe porque hierarquizar por dependência é ideal para compreensão mas uma armadilha sob prazo. \"Antes de se sentir pronto\" porque o limiar de execução (H-09) chega tarde demais.",
  },
  {
    id: "P-DEC",
    titulo: "Tomada de decisão",
    quandoUsar: "Qualquer decisão consumindo mais de alguns minutos.",
    box: `┌─ P-DEC: TOMADA DE DECISÃO ──────────────┐
│                                          │
│ 1. Classificar a decisão:                │
│    ☐ Reversível ou irreversível?         │
│    ☐ Custo do erro: baixo / alto?        │
│                                          │
│ 2. SE reversível + custo baixo:          │
│    ☐ Decidir AGORA com o modelo atual    │
│    ☐ Proibido pesquisar mais             │
│                                          │
│ 3. SE irreversível OU custo alto:        │
│    ☐ A premissa da decisão está clara?   │
│    ☐ Construir modelo mínimo             │
│    ☐ Validação cruzada: duas fontes      │
│    ☐ O próximo refinamento muda a        │
│      decisão?                            │
│      NÃO → decidir agora                │
│      SIM → refinar UMA rodada e voltar   │
│                                          │
│ 4. Registrar (1 linha):                  │
│    ☐ O que decidi + por quê              │
└──────────────────────────────────────────┘`,
    porque: "Para decisões triviais, pesquisa adicional não é diligência — é o motor de modelos rodando fora do domínio. O recurso escasso é energia executiva, não informação.",
  },
  {
    id: "P-PRJ",
    titulo: "Início de projetos",
    quandoUsar: "Qualquer projeto novo — freelance, acadêmico, empreendimento, pessoal. Este é o protocolo anti-Orbis.",
    box: `┌─ P-PRJ: INÍCIO DE PROJETO ──────────────┐
│                                          │
│ Escrever APENAS três campos:             │
│                                          │
│ 1. Objetivo:                             │
│    (uma frase; se precisar de duas,      │
│     o escopo está grande demais)         │
│                                          │
│ 2. Modelo mínimo que resolve:            │
│    (a MENOR versão que gera valor real)  │
│                                          │
│ 3. Primeira execução em <30 minutos:     │
│    (ação concreta iniciável HOJE)        │
│                                          │
│ REGRA: não existe quarto campo.          │
│ A arquitetura completa é PROIBIDA        │
│ até a primeira execução acontecer.       │
│                                          │
│ Checkpoint semanal:                      │
│ ☐ Executei algo novo esta semana?        │
│   NÃO → o projeto entrou em modo Orbis. │
│   Voltar ao campo 3.                     │
└──────────────────────────────────────────┘`,
    porque: "Os projetos que saíram do papel começaram com versão mínima executável. Os que estagnaram começaram pela ontologia.",
  },
  {
    id: "P-PRO",
    titulo: "Quebra de procrastinação",
    quandoUsar: "No momento em que perceber que uma tarefa está sendo evitada.",
    box: `┌─ P-PRO: QUEBRA DE PROCRASTINAÇÃO ───────┐
│                                          │
│ 1. Diagnóstico (30 segundos):            │
│    Consigo enxergar o que essa tarefa    │
│    gera depois de pronta?                │
│                                          │
│    NÃO → a tarefa está 'plana'.          │
│    Ir ao passo 2.                        │
│    SIM → ir ao passo 3.                  │
│                                          │
│ 2. Construir a cadeia (Botão 02):        │
│    Escrever 5 consequências em dominó:   │
│    tarefa → __ → __ → __ → __ → __      │
│                                          │
│    Última consequência deve tocar:       │
│    ☐ liberdade concreta (Botão 01)       │
│    ☐ um sistema meu em ordem (Botão 03)  │
│                                          │
│    Não consegue escrever 5?              │
│    → questionar se a tarefa precisa      │
│      ser feita. Talvez não precise.      │
│                                          │
│ 3. Reduzir a primeira ação:              │
│    ☐ Qual versão de 5 minutos existe?    │
│    ☐ Executar SÓ ela                     │
│                                          │
│ 4. Se nada funcionou:                    │
│    ☐ Mudar o AMBIENTE, não a vontade     │
│    (outro cômodo, biblioteca, fone,      │
│     celular em outra sala)               │
└──────────────────────────────────────────┘`,
    porque: "A mente não pergunta \"o que tenho que fazer?\" — pergunta \"o que acontece se eu fizer?\". Motivação é proporcional à clareza da cadeia. Mudar ambiente funciona porque o sistema responde mais ao contexto que à força de vontade.",
  },
  {
    id: "P-ABD",
    titulo: "Abandono de ideias e projetos",
    quandoUsar: "Quando um projeto ou crença está sob questionamento.",
    box: `┌─ P-ABD: ABANDONO DE IDEIAS/PROJETOS ────┐
│                                          │
│ Para CRENÇAS/TEORIAS:                    │
│ 1. ☐ A evidência contrária é confiável? │
│      NÃO → descartar evidência           │
│ 2. ☐ Replicou/confirmou de novo?        │
│      NÃO → replicar antes de decidir     │
│ 3. ☐ Existe teoria melhor disponível?   │
│      SIM → atualizar                     │
│      NÃO → manter + registrar anomalia   │
│                                          │
│ Para PROJETOS:                           │
│ 1. ☐ Executou algo nos últimos 30 dias? │
│ 2. ☐ A cadeia de consequências ainda    │
│      leva a uma liberdade que eu quero?  │
│ 3. ☐ Se eu visse este projeto hoje,     │
│      pela primeira vez, começaria ele?   │
│                                          │
│ Três NÃO → arquivar sem culpa.           │
│ Arquivar ≠ fracassar.                    │
│                                          │
│ REGRA DE HONESTIDADE:                    │
│ 3+ anomalias no mesmo modelo =           │
│ revisão obrigatória.                     │
└──────────────────────────────────────────┘`,
    porque: "O sistema é melhor em construir modelos do que em destruí-los. O registro escrito de anomalias transforma tolerância (saudável) em contabilidade (auditável).",
  },
  {
    id: "P-SES",
    titulo: "Sessão de trabalho",
    quandoUsar: "Toda sessão de trabalho planejada.",
    box: `┌─ P-SES: SESSÃO DE TRABALHO ─────────────┐
│                                          │
│ ANTES (2 minutos):                       │
│ ☐ Declarar o modo da sessão:             │
│   CIENTISTA (explorar, arquitetar,       │
│   entender) ou                           │
│   ENGENHEIRO (executar, terminar,        │
│   entregar)                              │
│ ☐ Declarar o critério de fim:            │
│   'esta sessão termina quando ______'    │
│                                          │
│ DURANTE:                                 │
│ ☐ Surgiu ideia do outro modo?            │
│   → anotar em 1 linha e VOLTAR           │
│                                          │
│ DEPOIS (1 minuto):                       │
│ ☐ Critério de fim atingido? S/N          │
│ ☐ 1 linha: o que a próxima sessão faz    │
│   primeiro                               │
│   (elimina o custo de reentrada —        │
│    a maior taxa do TDAH)                 │
└──────────────────────────────────────────┘`,
    porque: "Separar cientista/engenheiro evita que o explorador sequestre uma sessão de execução. A linha final (\"próxima sessão faz primeiro\") custa 20 segundos e economiza 20 minutos de reconstrução de contexto.",
  },
]

export function ProtocolosView() {
  const [aberto, setAberto] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Protocolos</h1>

      <div className="space-y-2">
        {PROTOCOLOS.map((p) => {
          const isOpen = aberto === p.id
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-border overflow-hidden bg-card"
            >
              {/* header */}
              <button
                onClick={() => setAberto(isOpen ? null : p.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                  {p.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{p.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    Quando usar: {p.quandoUsar}
                  </p>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* conteúdo */}
              {isOpen && (
                <div className="px-4 pb-5 space-y-4 border-t border-border">
                  <p className="text-xs text-muted-foreground pt-3">
                    <span className="font-medium text-foreground">Quando usar:</span>{" "}
                    {p.quandoUsar}
                  </p>

                  {/* caixa ASCII */}
                  <div className="rounded-xl bg-[#0d0f14] border border-border/60 p-4 overflow-x-auto">
                    <pre className="text-xs font-mono leading-relaxed text-[#e2e8f0] whitespace-pre">
                      {p.box}
                    </pre>
                  </div>

                  {/* por que funciona */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Por que funciona
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.porque}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
