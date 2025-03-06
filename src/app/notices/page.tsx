"use client"

import { useEffect, useState } from "react"
import { Inbox, Loader2, Plus } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { Button } from "@/components/ui/button"
import NoticeList from "@/components/NoticeList"
import AddNoticeModal from "@/components/notices/AddNoticeModal"
import NoticeDetails from "@/components/notices/NoticeDetails"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function NoticesPage() {
  const { toast } = useToast()
  const [notices, setNotices] = useState([])
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch notices
  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const { data } = await axiosInstance.get("/notices")
      setNotices(data.notices)
    } catch (error) {
      console.error("Error fetching notices:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch notices." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Notices Management</h1>
            <p className="text-muted-foreground">View and manage all tax notices, replies, and orders</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto" size="lg">
            <Plus className="mr-2 h-5 w-5" /> Add New Notice
          </Button>
        </div>

        <Separator />

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading notices...</p>
              </div>
            </CardContent>
          </Card>
        ) : notices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Notices Found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first notice</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Notice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border bg-card">
            <NoticeList onSelectNotice={setSelectedNoticeId} />
          </div>
        )}

        {/* Modals */}
        <AddNoticeModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} refreshNotices={fetchNotices} />
        {selectedNoticeId && (
          <NoticeDetails
            noticeId={selectedNoticeId}
            open={!!selectedNoticeId}
            onClose={() => setSelectedNoticeId(null)}
          />
        )}
      </div>
    </div>
  )
}

