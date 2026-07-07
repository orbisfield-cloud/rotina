import { SidebarDesktop, SidebarMobile } from "@/components/sidebar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="flex min-h-screen">
      <SidebarDesktop />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card sticky top-0 z-10">
          <SidebarMobile />
          <p className="text-sm text-muted-foreground capitalize">{hoje}</p>
        </header>
        <main className="flex-1 p-5">{children}</main>
      </div>
    </div>
  )
}
