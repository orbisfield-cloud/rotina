"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Pill, Dumbbell, Scale, Trophy, Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/suplementos", label: "Suplementos", icon: Pill },
  { href: "/treino", label: "Treino", icon: Dumbbell },
  { href: "/peso", label: "Peso", icon: Scale },
  { href: "/desafio", label: "Desafio", icon: Trophy },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
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
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
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
