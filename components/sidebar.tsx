"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard, Layers, Wallet, BookOpen, GraduationCap,
  Pill, Dumbbell, Scale, Trophy, Menu, X, ScrollText,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sections = [
  {
    label: null,
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "ACP",
    items: [
      { href: "/systems", label: "Sistemas", icon: Layers },
      { href: "/financeiro", label: "Financeiro", icon: Wallet },
      { href: "/log", label: "Registro Diário", icon: BookOpen },
      { href: "/graduacao", label: "Graduação", icon: GraduationCap },
      { href: "/protocolos", label: "Protocolos", icon: ScrollText },
    ],
  },
  {
    label: "Corpo",
    items: [
      { href: "/suplementos", label: "Suplementos", icon: Pill },
      { href: "/treino", label: "Treino", icon: Dumbbell },
      { href: "/peso", label: "Peso", icon: Scale },
      { href: "/desafio", label: "Desafio", icon: Trophy },
    ],
  },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {sections.map((section, i) => (
        <div key={i} className={i > 0 ? "mt-3" : ""}>
          {section.label && (
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.label}
            </p>
          )}
          {section.items.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function SidebarDesktop() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar min-h-screen">
      <div className="px-5 py-5 border-b border-border">
        <span className="text-lg font-bold text-foreground tracking-tight">Rotina</span>
      </div>
      <NavLinks />
    </aside>
  )
}

export function SidebarMobile() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu size={20} />
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0 bg-sidebar border-border" showCloseButton={false}>
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <span className="text-lg font-bold text-foreground tracking-tight">Rotina</span>
          <button onClick={() => setOpen(false)}>
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
