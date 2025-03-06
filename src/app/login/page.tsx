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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 via-blue-100 to-white">
      <div className="w-full max-w-md z-10 px-4">
        <Card className="w-full border border-blue-100 shadow-lg bg-white rounded-2xl">
          <CardHeader className="pt-8 pb-4">
            <div className="mx-auto w-16 h-16 mb-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-center text-blue-800">Welcome Back</CardTitle>
            <p className="text-center text-blue-600/70 mt-2">Sign in to your account to continue</p>
          </CardHeader>

          <CardContent className="px-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-blue-700">
                  <Mail className="h-4 w-4 text-blue-500 mr-2 inline" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-4 pr-4 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-blue-700">
                  <Lock className="h-4 w-4 text-blue-500 mr-2 inline" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-4 pr-4 rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="px-8 py-6 flex justify-center border-t bg-blue-50">
            <p className="text-sm text-blue-600/70">Secure login powered by Tax Management System</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
