"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect all visitors to the login page
    router.push("/login")
    setLoading(false)
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  return null // No UI needed, just handling redirects
}

