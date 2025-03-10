"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/store/useAuthStore"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("") // State to store login error message
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("") // Reset error message before new attempt

    try {
      const success = await login(email, password)
      if (success) {
        setTimeout(() => {
          router.push("/dashboard")
        }, 800)
      } else {
        setError("Incorrect email or password") // Display error if login fails
      }
    } catch (err) {
      setError("Incorrect email or password") // Handle login failure
    } finally {
      setTimeout(() => setIsLoading(false), 800)
    }
  }

  if (!mounted) {
    return null // Prevent rendering until client-side
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background/50 via-background to-background p-4 sm:p-8">
      <div className="w-full max-w-md z-10">
        <Card className="w-full border shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="pt-8 pb-4">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Welcome Back</CardTitle>
            <p className="text-center text-muted-foreground mt-2 text-sm sm:text-base">
              Sign in to your account to continue
            </p>
          </CardHeader>

          <CardContent className="px-6 sm:px-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary/70" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-primary/70" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-lg"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && <p className="text-destructive text-sm text-center">{error}</p>}

              <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="px-6 sm:px-8 py-5 flex justify-center border-t bg-muted/50">
            <p className="text-xs sm:text-sm text-muted-foreground">Secure login powered by Tax Management System</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

