"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/utils/axiosInstance"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CalendarIcon,
  CheckCircle2Icon,
  Clock,
  InboxIcon,
  AlertTriangleIcon,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import EditNoticeModal from "@/components/notices/edit-notice-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  notices: Notice[]
  onSelectNotice?: (noticeId: string) => void
  selectedClient?: string
  selectedTaxYear?: string
  selectedTaxOffice?: string
}

export default function NoticeList({
  limit,
  className,
  clientId,
  onSelectNotice,
  selectedClient,
  selectedTaxYear,
  selectedTaxOffice,

}: NoticeListProps) {
  const { toast } = useToast()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotices = async () => {
      if (notices.length > 0) return

      try {
        setLoading(true)
        let endpoint = "/notices"
        const filters: string[] = []

        if (clientId) {
          filters.push(`client=${encodeURIComponent(clientId)}`)
        }

        if (selectedTaxYear && selectedTaxYear !== "all") {
          filters.push(`taxYear=${encodeURIComponent(selectedTaxYear)}`)
        }

        if (selectedClient && selectedClient !== "all") {
          filters.push(`client=${encodeURIComponent(selectedClient)}`)
        }

        if (selectedTaxOffice && selectedTaxOffice !== "all") {
          filters.push(`taxOffice=${encodeURIComponent(selectedTaxOffice)}`);
        }

        if (filters.length > 0) {
          endpoint += `?${filters.join("&")}`
        }

        console.log("Fetching Notices:", endpoint)
        const { data } = await axiosInstance.get(endpoint)
        setNotices(limit ? data.notices.slice(0, limit) : data.notices)
      } catch (error) {
        console.error("Error fetching notices:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [limit, filter, clientId, selectedClient, selectedTaxYear])
  // ✅ Remove `notices` from dependencies

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

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      await axiosInstance.delete(`/notices/${noticeId}`)
      setNotices((prevNotices) => prevNotices.filter((notice) => notice._id !== noticeId))
      toast({ title: "Success", description: "Notice deleted successfully." })
      setIsDeleteConfirmOpen(false)
    } catch (error) {
      console.error("Error deleting notice:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to delete notice." })
    }
  }

  const filteredNotices = notices.filter((notice) => filter === "all" || notice.status === filter)

  // Check if due date is valid
  const isValidDate = (dateString: string) => {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1970
  }

  // Check if due date is past
  const isOverdue = (dueDate: string) => {
    if (!isValidDate(dueDate)) return false
    return new Date(dueDate) < new Date()
  }

  // Format due date or return N/A if invalid
  const formatDueDate = (dueDate: string) => {
    if (!isValidDate(dueDate)) return "N/A"
    return new Date(dueDate).toLocaleDateString("en-GB")
  }

  const refreshNotices = async () => {
    try {
      setLoading(true)
      let endpoint = clientId ? `/clients/${clientId}/notices` : "/notices"

      if (filter !== "all") {
        endpoint += endpoint.includes("?") ? `&status=${filter}` : `?status=${filter}`
      }

      const { data } = await axiosInstance.get(endpoint)
      setNotices(limit ? data.notices.slice(0, limit) : data.notices)
    } catch (error) {
      console.error("Error fetching notices:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="px-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl">
            {clientId ? `Notices for ${selectedClient || "Selected Client"}` : "All Notices"}
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
                className="group relative flex flex-col gap-2 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-md focus-within:bg-muted/50 focus-within:shadow-md"
                tabIndex={0}
                role="button"
                onClick={(e) => {
                  // Only trigger onSelectNotice if the click is not on a button or dropdown
                  if (
                    !(e.target as HTMLElement).closest("button") &&
                    !(e.target as HTMLElement).closest('[role="menu"]')
                  ) {
                    onSelectNotice?.(notice._id)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelectNotice?.(notice._id)
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-medium leading-none text-lg truncate">{notice.heading}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      Client: {clientId && selectedClient ? selectedClient : notice.client?.name || "Unknown"}
                    </p>
                  </div>
                  <Badge
                    variant={notice.status === "Completed" ? "default" : "secondary"}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1 self-start sm:self-auto",
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span
                      className={cn(
                        "text-muted-foreground truncate",
                        isOverdue(notice.dueDate) &&
                          notice.status === "Pending" &&
                          "text-red-600 font-medium flex items-center",
                      )}
                    >
                      Due: {formatDueDate(notice.dueDate)}
                      {isOverdue(notice.dueDate) && notice.status === "Pending" && (
                        <AlertTriangleIcon className="ml-1 h-3 w-3 text-red-600 flex-shrink-0" />
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectNotice?.(notice._id)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedNoticeId(notice._id)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Notice
                        </DropdownMenuItem>
                        {notice.status === "Pending" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsCompleted(notice._id)
                            }}
                          >
                            <CheckCircle2Icon className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        {notice.status === "Completed" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsPending(notice._id)
                            }}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Mark as Pending
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setNoticeToDelete(notice._id)
                            setIsDeleteConfirmOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Notice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {/* Edit Notice Modal */}
      {isEditModalOpen && selectedNoticeId && (
        <EditNoticeModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          refreshNotices={refreshNotices}
          noticeId={selectedNoticeId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (noticeToDelete) {
                  handleDeleteNotice(noticeToDelete)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

