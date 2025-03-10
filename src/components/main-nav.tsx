"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboardIcon, UsersIcon, FileTextIcon, DatabaseIcon, Menu, X } from "lucide-react"
import { useState } from "react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/clients", label: "Clients", icon: UsersIcon },
  { href: "/notices", label: "Notices", icon: FileTextIcon },
  { href: "/data", label: "Data", icon: DatabaseIcon },
]

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Hide navigation on the login page
  if (pathname === "/login") return null
  if (pathname === "/") return null

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex h-16 items-center justify-between">
          <nav className="flex items-center space-x-4 lg:space-x-6">
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
                    <span>{label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex-shrink-0">
            <Image
              src="/nav.png"
              alt="BKR International Independent Member"
              width={100}
              height={32}
              className="h-auto w-auto"
              priority
            />
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 px-2 py-6">
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Image
                      src="/nav.png"
                      alt="BKR International Independent Member"
                      width={100}
                      height={32}
                      className="h-auto w-auto"
                      priority
                    />
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>

                <nav className="flex flex-col space-y-3">
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href

                    return (
                      <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start py-2 px-3 text-sm font-medium flex items-center gap-3 rounded-lg transition-all duration-200",
                            "hover:bg-primary/10 hover:text-primary active:scale-95",
                            isActive ? "text-primary bg-primary/10" : "text-muted-foreground",
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{label}</span>
                        </Button>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}

