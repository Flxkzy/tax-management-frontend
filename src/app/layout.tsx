import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import "./globals.css"
import "../../public/tailwind.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tax Management System",
  description: "Manage your clients and tax information efficiently",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <div className="container flex h-16 items-center px-4">
                <MainNav />
                <div className="ml-auto flex items-center space-x-4">
                  <ThemeToggle />
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
