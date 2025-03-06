"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, UserPlus, AlertCircle, ArrowLeft, CheckCircle2, User, Mail, Lock, Shield } from "lucide-react"
import axios from "@/utils/axiosInstance"

export default function AddUser() {
  const { user, token } = useAuthStore()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")

  // Redirect if not admin - moved this outside of the conditional rendering logic
  if (!user || user.role !== "admin") {
    router.push("/dashboard")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    // Calculate password strength when password field changes
    if (e.target.name === "password") {
      calculatePasswordStrength(e.target.value)
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value })
  }

  const calculatePasswordStrength = (password: string) => {
    // Simple password strength calculation
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-red-500"
    if (passwordStrength === 1) return "bg-orange-500"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return "Very Weak"
    if (passwordStrength === 1) return "Weak"
    if (passwordStrength === 2) return "Medium"
    if (passwordStrength === 3) return "Strong"
    return "Very Strong"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post("/auth/add-user", formData, { headers: { Authorization: `Bearer ${token}` } })
      setSuccessMessage(`${formData.name} has been successfully added as a ${formData.role}.`)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError("Failed to add user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Add User</h1>
      </div>

      <Card className="border-none shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            <CardTitle>Add New User</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80">
            Create a new user account with specific permissions
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="mb-6 animate-in fade-in-50 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter user's full name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  required
                />

                {formData.password && (
                  <div className="space-y-1 mt-1">
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Password strength:
                      <span className="font-medium">{getStrengthText()}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  User Role
                </Label>
                <Select name="role" value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Regular User</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.role === "admin"
                    ? "Administrators have full access to all features and settings."
                    : "Regular users have limited access to the system."}
                </p>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between gap-4 border-t p-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>

          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Add User
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

