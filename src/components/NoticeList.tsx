"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/utils/axiosInstance"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // ✅ Import Button
import { CalendarIcon, CheckCircle2Icon, Clock, InboxIcon, AlertTriangleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast" // ✅ Import Toast Hook

interface Notice {
  _id: string
  heading: string
  dueDate: string
  client: { _id: string; name: string }
  status: "Pending" | "Completed"
}

interface NoticeListProps {
  limit?: number
  className?: string
  clientId?: string
  onSelectNotice?: (noticeId: string) => void
}

export default function NoticeList({ limit, className, clientId, onSelectNotice }: NoticeListProps) {
  const { toast } = useToast()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true)
        let endpoint = clientId ? `/clients/${clientId}/notices` : "/notices"

        if (filter !== "all") {
          endpoint += endpoint.includes("?") ? `&status=${filter}` : `?status=${filter}`
        }

        console.log("Fetching from:", endpoint)
        const { data } = await axiosInstance.get(endpoint)
        setNotices(limit ? data.notices.slice(0, limit) : data.notices)
      } catch (error) {
        console.error("Error fetching notices:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [limit, filter, clientId])

  const handleMarkAsCompleted = async (noticeId: string) => {
    try {
      await axiosInstance.put(`/notices/${noticeId}/completed`)
      setNotices((prevNotices) =>
        prevNotices.map((notice) => (notice._id === noticeId ? { ...notice, status: "Completed" } : notice)),
      )
      toast({ title: "Success", description: "Notice marked as completed." })
    } catch (error) {
      console.error("Error marking notice as completed:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to mark notice as completed." })
    }
  }

  // ✅ Add function to mark notice as pending
  const handleMarkAsPending = async (noticeId: string) => {
    try {
      await axiosInstance.put(`/notices/${noticeId}/pending`)
      setNotices((prevNotices) =>
        prevNotices.map((notice) => (notice._id === noticeId ? { ...notice, status: "Pending" } : notice)),
      )
      toast({ title: "Success", description: "Notice marked as pending." })
    } catch (error) {
      console.error("Error marking notice as pending:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to mark notice as pending." })
    }
  }

  const filteredNotices = notices.filter((notice) => filter === "all" || notice.status === filter)

  // Check if due date is past
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="px-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl">
            {clientId ? `Notices for ${notices[0]?.client?.name || "Selected Client"}` : "All Notices"}
          </CardTitle>
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="px-4">
                All
              </TabsTrigger>
              <TabsTrigger value="Pending" className="px-4">
                Pending
              </TabsTrigger>
              <TabsTrigger value="Completed" className="px-4">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="px-6 pt-2">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg">
                <Skeleton className="h-5 w-[250px]" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-6 w-[100px] rounded-full" />
                </div>
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg">
            <InboxIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notices found</h3>
            <p className="text-muted-foreground">
              {filter === "all" ? "There are no notices available." : `No ${filter.toLowerCase()} notices found.`}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredNotices.map((notice) => (
              <li
                key={notice._id}
                onClick={() => onSelectNotice?.(notice._id)}
                className="group relative flex flex-col gap-2 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-md focus-within:bg-muted/50 focus-within:shadow-md"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelectNotice?.(notice._id)
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none text-lg">{notice.heading}</h3>
                    <p className="text-sm text-muted-foreground">Client: {notice.client?.name || "Unknown"}</p>
                  </div>
                  <Badge
                    variant={notice.status === "Completed" ? "default" : "secondary"}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1",
                      notice.status === "Completed"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                    )}
                  >
                    {notice.status === "Completed" ? (
                      <CheckCircle2Icon className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {notice.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    <span
                      className={cn(
                        "text-muted-foreground",
                        isOverdue(notice.dueDate) &&
                          notice.status === "Pending" &&
                          "text-red-600 font-medium flex items-center",
                      )}
                    >
                      Due: {new Date(notice.dueDate).toLocaleDateString()}
                      {isOverdue(notice.dueDate) && notice.status === "Pending" && (
                        <AlertTriangleIcon className="ml-1 h-3 w-3 text-red-600" />
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* ✅ "Mark as Completed" Button */}
                    {notice.status === "Pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation() // ✅ Prevent triggering `onSelectNotice`
                          handleMarkAsCompleted(notice._id)
                        }}
                        className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white transition-colors"
                      >
                        <CheckCircle2Icon className="mr-1 h-3 w-3" />
                        Mark as Completed
                      </Button>
                    )}
                    {/* ✅ "Mark as Pending" Button for Completed notices */}
                    {notice.status === "Completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering `onSelectNotice`
                          handleMarkAsPending(notice._id)
                        }}
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Mark as Pending
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectNotice?.(notice._id)
                      }}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

