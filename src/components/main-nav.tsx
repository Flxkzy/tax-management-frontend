"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboardIcon, UsersIcon, FileTextIcon } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/clients", label: "Clients", icon: UsersIcon },
  { href: "/notices", label: "Notices", icon: FileTextIcon },
]

export function MainNav() {
  const pathname = usePathname()

  // Hide navigation on the login page
  if (pathname === "/login") return null
  if (pathname === "/") return null

  return (
    <nav className="relative">
      <div className="flex items-center space-x-4 lg:space-x-6">
        <Link href="/dashboard" className="mr-4 flex-shrink-0">
          <Image
            src="/nav.png"
            alt="BKR International Independent Member"
            width={120}
            height={40}
            className="h-auto w-auto"
            priority
          />
        </Link>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href

          return (
            <Link key={href} href={href} passHref>
              <Button
                variant="ghost"
                className={cn(
                  "relative h-auto py-2 px-3 text-sm font-medium flex items-center gap-2 rounded-lg transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary active:scale-95",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

