"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const DownloadBackupButton = ({ className }: { className?: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      setIsSuccess(false)

      // ✅ Use fetch with streaming support
      const response = await fetch(`${API_URL}/backup/download`, {
        method: "GET",
        headers: {
          "Content-Type": "application/zip",
        },
      })

      if (!response.ok) {
        throw new Error(`Error downloading file: ${response.statusText}`)
      }

      // ✅ Convert response to blob for file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "firebase_backup.zip")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsSuccess(true)
      toast({
        title: "Backup downloaded successfully",
        description: "Your backup file has been downloaded to your device.",
        variant: "success",
      })

      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("❌ Error downloading backup:", error)
      toast({
        title: "Download failed",
        description: "Failed to download backup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant={isSuccess ? "outline" : "default"}
      className={`relative transition-all ${className}`}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Preparing Backup...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span>Download Complete</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Download Backup</span>
          </>
        )}
      </span>
    </Button>
  )
}

export default DownloadBackupButton

