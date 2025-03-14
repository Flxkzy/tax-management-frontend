"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import AuthGuard from "@/components/AuthGuard"; // Ensure it's imported
import "./globals.css";
import "../../public/tailwind.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthGuard> {/* Ensures authentication before rendering */}
            <div className="min-h-screen flex flex-col">
              {pathname !== "/login" && (
                <header className="border-b">
                  <div className="container flex h-16 items-center px-4">
                    <MainNav />
                    <div className="ml-auto flex items-center space-x-4">
                      <ThemeToggle />
                      <UserNav />
                    </div>
                  </div>
                </header>
              )}
              <main className="flex-1">{children}</main>
            </div>
          </AuthGuard>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
