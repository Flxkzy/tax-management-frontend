"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DownloadBackupButton from "@/components/DownloadBackupButton"
import { Shield, Database, ArrowRight, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function TestBackupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <Card className="w-full max-w-md shadow-md border-border/60 overflow-hidden bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="rounded-full p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <Database className="h-5 w-5" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Creates a complete system backup</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardTitle className="text-2xl font-bold">System Backup</CardTitle>
          <CardDescription>Download a complete backup of your data for safekeeping or transfer</CardDescription>
        </CardHeader>
        <Separator className="mx-6" />
        <CardContent className="pt-6 pb-2 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="rounded-full p-1 bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
              <Shield className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Secure Encrypted Backup</p>
              <p className="text-muted-foreground text-xs mt-0.5">Your data is encrypted during transfer</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="text-muted-foreground">
              The backup includes all your notices, client data, and system configuration.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
          <DownloadBackupButton className="w-full" />
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Return to Dashboard <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

