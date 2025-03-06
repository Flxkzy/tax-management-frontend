"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LogOut, UserPlus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useAuthStore from "@/store/useAuthStore"
import Link from "next/link"

export function UserNav() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const [isUserLoaded, setIsUserLoaded] = useState(false)

  useEffect(() => {
    setIsUserLoaded(true)
  }, [])

  // Hide UserNav on the login page or if user data is not loaded
  if (pathname === "/login" || !isUserLoaded || !user) return null
  if (pathname === "/" || !isUserLoaded || !user) return null


  // Get initials for avatar fallback (up to 2 characters)
  const getInitials = () => {
    if (!user?.name) return "U"

    const nameParts = user.name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0)

    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 px-2 flex items-center gap-1 rounded-full hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring transition-colors"
        >
          <Avatar className="h-8 w-8 border-2 border-primary/10">
            <AvatarImage src="/avatars/01.png" alt={user?.name || "User"} className="object-cover" />
            <AvatarFallback className="bg-primary/5 text-primary font-medium">{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block">{user?.name || "User"}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="end" forceMount sideOffset={8} alignOffset={0}>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user?.name}</p>
          <p className="text-xs text-muted-foreground leading-none mt-1">{user?.email}</p>
          <div className="mt-1">
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {user?.role === "admin" ? "Administrator" : "User"}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {user.role === "admin" && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Admin Actions</DropdownMenuLabel>
            <Link href="/admin/add-user" className="block">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 rounded-md transition-colors focus:bg-accent">
                <UserPlus className="h-4 w-4 text-primary" />
                <span>Add New User</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

