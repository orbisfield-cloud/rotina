interface Horario { dayOfWeek: number; startTime: string; endTime: string }
interface Disciplina { id: string; name: string; color: string; schedules: Horario[] }

const SLOTS = [
  { start: "07:00", end: "09:00", label: "07–09h" },
  { start: "09:00", end: "11:00", label: "09–11h" },
  { start: "11:00", end: "13:00", label: "11–13h" },
  { start: "13:00", end: "15:00", label: "13–15h" },
  { start: "15:00", end: "17:00", label: "15–17h" },
  { start: "17:00", end: "19:00", label: "17–19h" },
  { start: "19:00", end: "21:00", label: "19–21h" },
]

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"]

function overlaps(sched: Horario, slot: typeof SLOTS[number]) {
  return sched.startTime < slot.end && sched.endTime > slot.start
}

export function GradeHoraria({ disciplinas }: { disciplinas: Disciplina[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-16 py-2 pr-3 text-right text-muted-foreground font-medium" />
            {DIAS.map(d => (
              <th key={d} className="py-2 px-1 text-center font-semibold text-foreground">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map(slot => (
            <tr key={slot.start} className="border-t border-border/40">
              <td className="py-1.5 pr-3 text-right text-muted-foreground text-[10px] align-top pt-2">
                {slot.label}
              </td>
              {DIAS.map((_, diaIdx) => {
                const dayOfWeek = diaIdx + 1
                const aulas = disciplinas.flatMap(d =>
                  d.schedules
                    .filter(s => s.dayOfWeek === dayOfWeek && overlaps(s, slot))
                    .map(s => ({ ...s, nome: d.name, cor: d.color }))
                )
                return (
                  <td key={diaIdx} className="py-1 px-1 align-top">
                    {aulas.length > 0 ? (
                      <div className="space-y-0.5">
                        {aulas.map((a, i) => (
                          <div
                            key={i}
                            className="rounded-lg px-2 py-1.5 text-[11px] font-medium leading-tight"
                            style={{ background: `${a.cor}25`, color: a.cor, borderLeft: `2px solid ${a.cor}` }}
                          >
                            <div>{a.nome}</div>
                            <div className="text-[10px] opacity-70 font-normal mt-0.5">
                              {a.startTime}–{a.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-10 rounded-lg bg-secondary/20 border border-border/20" />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
