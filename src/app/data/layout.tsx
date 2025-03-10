import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "File Manager",
  description: "Manage your files and folders",
}

export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}

