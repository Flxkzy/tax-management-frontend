"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/utils/axiosInstance"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UploadFile from "@/components/notices/UploadFile"
import { useToast } from "@/hooks/use-toast"
import type { AxiosError } from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, FileIcon, FileTextIcon, Loader2Icon, PlusIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface NoticeDetailsProps {
  noticeId: string
  open: boolean
  onClose: () => void
}

export default function NoticeDetails({ noticeId, open, onClose }: NoticeDetailsProps) {
  const { toast } = useToast()
  const [notice, setNotice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Reply state
  const [reply, setReply] = useState({ heading: "", replyDate: "" })
  const [replyDate, setReplyDate] = useState<Date | undefined>(undefined)
  const [replyFileUrl, setReplyFileUrl] = useState<string>("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // Order state
  const [order, setOrder] = useState({ heading: "", receivingDate: "", demandedIncomeTax: "" })
  const [orderReceivingDate, setOrderReceivingDate] = useState<Date | undefined>(undefined)
  const [orderFileUrl, setOrderFileUrl] = useState<string>("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  // Received notice state
  const [receivedNotice, setReceivedNotice] = useState({
    heading: "",
    dueDate: "",
    hearingDate: "",
    receivingDate: "", // Add this line
  })
  const [receivedNoticeDueDate, setReceivedNoticeDueDate] = useState<Date | undefined>(undefined)
  const [receivedNoticeHearingDate, setReceivedNoticeHearingDate] = useState<Date | undefined>(undefined)
  const [receivedNoticeReceivingDate, setReceivedNoticeReceivingDate] = useState<Date | undefined>(undefined)
  const [receivedNoticeFileUrl, setReceivedNoticeFileUrl] = useState<string>("")
  const [isSubmittingReceivedNotice, setIsSubmittingReceivedNotice] = useState(false)

  useEffect(() => {
    // Fix for Safari and mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement

      // Force focus on calendar buttons when touched
      if (target.closest('[role="button"]') && (target.closest('[role="dialog"]') || target.closest('[role="grid"]'))) {
        // Prevent default only for calendar elements
        e.preventDefault()

        // Force focus on the element
        ;(target as HTMLElement).focus()

        // Simulate a click
        target.click()
      }
    }

    // Add global click handler for iOS Safari
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Handle calendar button clicks
      if (target.closest('[role="button"]') && (target.closest('[role="dialog"]') || target.closest('[role="grid"]'))) {
        e.stopPropagation()
      }
    }

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: false })
    document.addEventListener("click", handleGlobalClick, { capture: true })

    // Clean up
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("click", handleGlobalClick, { capture: true })
    }
  }, [])

  useEffect(() => {
    const fetchNoticeDetails = async () => {
      try {
        const { data } = await axiosInstance.get(`/notices/${noticeId}`)
        setNotice(data)
      } catch (error) {
        console.error("Error fetching notice details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notice details.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (open) fetchNoticeDetails()
  }, [noticeId, open, toast])

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const handleSubmitReceivedNotice = async () => {
    try {
      if (!receivedNoticeFileUrl) {
        toast({ variant: "destructive", title: "Error", description: "Please upload a file first." })
        return
      }

      if (!receivedNotice.heading || !receivedNotice.receivingDate) {
        toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields." })
        return
      }

      setIsSubmittingReceivedNotice(true)
      const response = await axiosInstance.post(`/notices/${noticeId}/received-notice`, {
        ...receivedNotice,
        fileUrl: receivedNoticeFileUrl,
      })

      toast({ title: "Success", description: "Received Notice added successfully." })

      setNotice((prev: any) => ({
        ...prev,
        receivedNotices: [...prev.receivedNotices, { ...receivedNotice, fileUrl: receivedNoticeFileUrl }],
        dueDate: response.data.updatedNotice.dueDate,
        hearingDate: response.data.updatedNotice.hearingDate,
      }))

      setReceivedNotice({ heading: "", dueDate: "", hearingDate: "", receivingDate: "" })
      setReceivedNoticeDueDate(undefined)
      setReceivedNoticeHearingDate(undefined)
      setReceivedNoticeReceivingDate(undefined)
      setReceivedNoticeFileUrl("")
    } catch (error) {
      console.error("Error adding received notice:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to add received notice." })
    } finally {
      setIsSubmittingReceivedNotice(false)
    }
  }

  const handleSubmitReply = async () => {
    try {
      if (!replyFileUrl) {
        toast({ variant: "destructive", title: "Error", description: "Please upload a file first." })
        return
      }

      setIsSubmittingReply(true)
      await axiosInstance.post(`/notices/${noticeId}/reply`, { ...reply, fileUrl: replyFileUrl })
      toast({ title: "Success", description: "Reply added successfully" })

      setReply({ heading: "", replyDate: "" })
      setReplyDate(undefined)
      setReplyFileUrl("")
      setNotice((prev: any) => ({
        ...prev,
        replies: [...prev.replies, { ...reply, fileUrl: replyFileUrl }],
      }))
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add reply." })
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleSubmitOrder = async () => {
    try {
      if (!orderFileUrl) {
        toast({ variant: "destructive", title: "Error", description: "Please upload a file first." })
        return
      }

      setIsSubmittingOrder(true)
      await axiosInstance.post(`/notices/${noticeId}/order`, { ...order, fileUrl: orderFileUrl })
      toast({ title: "Success", description: "Order added successfully" })

      setOrder({ heading: "", receivingDate: "", demandedIncomeTax: "" })
      setOrderReceivingDate(undefined)
      setOrderFileUrl("")
      setNotice((prev: any) => ({
        ...prev,
        orders: [...prev.orders, { ...order, fileUrl: orderFileUrl }],
      }))
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      console.error("Error in handleSubmitOrder:", axiosError.response ? axiosError.response.data : axiosError.message)

      toast({
        variant: "destructive",
        title: "Error",
        description: axiosError.response?.data?.message || "Failed to add order.",
      })
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  // Handle date selection from calendar
  const handleDateChange = (date: Date | undefined, field: string, stateUpdater: Function) => {
    // Update the date picker state
    stateUpdater(date)

    if (date) {
      // Format date as YYYY-MM-DD for backend
      const formattedDate = format(date, "yyyy-MM-dd")

      if (field.startsWith("reply")) {
        setReply((prev) => ({ ...prev, replyDate: formattedDate }))
      } else if (field.startsWith("order")) {
        setOrder((prev) => ({ ...prev, receivingDate: formattedDate }))
      } else if (field.includes("Due")) {
        setReceivedNotice((prev) => ({ ...prev, dueDate: formattedDate }))
      } else if (field.includes("Hearing")) {
        setReceivedNotice((prev) => ({ ...prev, hearingDate: formattedDate }))
      } else if (field.includes("Receiving")) {
        setReceivedNotice((prev) => ({ ...prev, receivingDate: formattedDate }))
      }
    } else {
      // Clear the date if undefined
      if (field.startsWith("reply")) {
        setReply((prev) => ({ ...prev, replyDate: "" }))
      } else if (field.startsWith("order")) {
        setOrder((prev) => ({ ...prev, receivingDate: "" }))
      } else if (field.includes("Due")) {
        setReceivedNotice((prev) => ({ ...prev, dueDate: "" }))
      } else if (field.includes("Hearing")) {
        setReceivedNotice((prev) => ({ ...prev, hearingDate: "" }))
      } else if (field.includes("Receiving")) {
        setReceivedNotice((prev) => ({ ...prev, receivingDate: "" }))
      }
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Notice Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching notice information...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{notice?.heading || "Notice Details"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View and manage notice details, replies, and orders
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="space-y-6 pr-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notice Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="font-medium">{notice.client?.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Commissioner</Label>
                  <p className="font-medium">{notice.commissioner}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Tax Authority</Label>
                  <p className="font-medium">{notice.taxAuthority}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Tax Year</Label>
                  <p className="font-medium">{notice.taxYear}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Tax Office</Label>
                  <p className="font-medium">{notice.taxOffice || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        notice.status === "Pending"
                          ? "bg-yellow-500"
                          : notice.status === "Completed"
                            ? "bg-green-500"
                            : notice.status === "Overdue"
                              ? "bg-red-500"
                              : "bg-blue-500"
                      }`}
                    ></span>
                    {notice.status}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2 mt-2 flex justify-end">
                  {notice.fileUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer">
                        View File
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Receiving Date</Label>
                  <p className="font-medium">{formatDisplayDate(notice.receivingDate)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p className="font-medium flex items-center">
                    {formatDisplayDate(notice.dueDate)}
                    {new Date(notice.dueDate) < new Date() ? (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Overdue</span>
                    ) : new Date(notice.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        Approaching
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Hearing Date</Label>
                  <p className="font-medium">{notice.hearingDate ? formatDisplayDate(notice.hearingDate) : "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="replies" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="replies" className="flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  Replies ({notice.replies.length})
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4" />
                  Orders ({notice.orders.length})
                </TabsTrigger>
                <TabsTrigger value="received-notices" className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4" />
                  Received Notices ({notice.receivedNotices?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="replies" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Replies</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {notice.replies.length > 0 ? (
                      <div className="space-y-4">
                        {notice.replies.map((reply: any, index: number) => (
                          <div
                            key={reply._id || `reply-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg gap-2"
                          >
                            <div>
                              <p className="font-medium">{reply.heading}</p>
                              <p className="text-sm text-muted-foreground">
                                <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                                {formatDisplayDate(reply.replyDate)}
                              </p>
                            </div>
                            {reply.fileUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={reply.fileUrl} target="_blank" rel="noopener noreferrer">
                                  View File
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No replies found.</p>
                    )}

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h4 className="font-medium">Add New Reply</h4>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="reply-heading">Reply Heading</Label>
                          <Input
                            id="reply-heading"
                            placeholder="Enter reply heading"
                            value={reply.heading}
                            onChange={(e) => setReply({ ...reply, heading: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="reply-date">Reply Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="reply-date"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !replyDate && "text-muted-foreground",
                                )}
                                onClick={(e) => {
                                  // Prevent default behavior to help with iOS Safari
                                  e.preventDefault()
                                  // Force focus on the button
                                  e.currentTarget.focus()
                                }}
                                onTouchStart={(e) => {
                                  // Prevent default for touch events
                                  e.preventDefault()
                                  // Force focus
                                  e.currentTarget.focus()
                                }}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {replyDate ? format(replyDate, "dd/MM/yyyy") : <span>Select date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                              sideOffset={8}
                              side="bottom"
                              avoidCollisions={false}
                              onInteractOutside={(e) => {
                                // Prevent closing when interacting with date elements
                                if ((e.target as HTMLElement).closest('[role="dialog"]')) {
                                  e.preventDefault()
                                }
                              }}
                            >
                              <div className="z-50 bg-background border rounded-md shadow-md">
                                <Calendar
                                  mode="single"
                                  selected={replyDate}
                                  onSelect={(date) => handleDateChange(date, "replyDate", setReplyDate)}
                                  initialFocus
                                  disabled={(date) => date < new Date("1900-01-01")}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-2">
                          <Label>Upload Reply Document</Label>
                          <div className="border rounded-md p-2">
                            <UploadFile
                              type="reply"
                              noticeId={noticeId}
                              clientName={notice.client?.name || ""}
                              noticeHeading={notice.heading || ""}
                              sectionHeading={reply.heading}
                              onFileUpload={(url) => setReplyFileUrl(url)}
                            />
                            {replyFileUrl && (
                              <p className="text-xs text-green-600 mt-1">
                                <FileIcon className="inline-block w-3 h-3 mr-1" />
                                File uploaded successfully
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handleSubmitReply}
                          disabled={!reply.heading || !reply.replyDate || isSubmittingReply}
                          className="w-full"
                        >
                          {isSubmittingReply ? (
                            <>
                              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <PlusIcon className="mr-2 h-4 w-4" />
                              Add Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {notice.orders.length > 0 ? (
                      <div className="space-y-4">
                        {notice.orders.map((order: any, index: number) => (
                          <div
                            key={order._id || `order-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg gap-2"
                          >
                            <div>
                              <p className="font-medium">{order.heading}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                {order.receivingDate && (
                                  <p>
                                    <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                                    {formatDisplayDate(order.receivingDate)}
                                  </p>
                                )}
                                {order.demandedIncomeTax && (
                                  <p className="font-medium">Demanded Tax: {order.demandedIncomeTax}</p>
                                )}
                              </div>
                            </div>
                            {order.fileUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={order.fileUrl} target="_blank" rel="noopener noreferrer">
                                  View File
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No orders found.</p>
                    )}

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h4 className="font-medium">Add New Order</h4>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>Order Heading</Label>
                          <Input
                            placeholder="Enter order heading"
                            value={order.heading}
                            onChange={(e) => setOrder({ ...order, heading: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Receiving Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !orderReceivingDate && "text-muted-foreground",
                                  )}
                                  onClick={(e) => {
                                    // Prevent default behavior to help with iOS Safari
                                    e.preventDefault()
                                    // Force focus on the button
                                    e.currentTarget.focus()
                                  }}
                                  onTouchStart={(e) => {
                                    // Prevent default for touch events
                                    e.preventDefault()
                                    // Force focus
                                    e.currentTarget.focus()
                                  }}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {orderReceivingDate ? (
                                    format(orderReceivingDate, "dd/MM/yyyy")
                                  ) : (
                                    <span>Select date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                                sideOffset={8}
                                side="bottom"
                                avoidCollisions={false}
                                onInteractOutside={(e) => {
                                  // Prevent closing when interacting with date elements
                                  if ((e.target as HTMLElement).closest('[role="dialog"]')) {
                                    e.preventDefault()
                                  }
                                }}
                              >
                                <div className="z-50 bg-background border rounded-md shadow-md">
                                  <Calendar
                                    mode="single"
                                    selected={orderReceivingDate}
                                    onSelect={(date) =>
                                      handleDateChange(date, "orderReceivingDate", setOrderReceivingDate)
                                    }
                                    initialFocus
                                    disabled={(date) => date < new Date("1900-01-01")}
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="grid gap-2">
                            <Label>Demanded Income Tax</Label>
                            <Input
                              placeholder="Enter amount"
                              value={order.demandedIncomeTax}
                              onChange={(e) => setOrder({ ...order, demandedIncomeTax: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Upload Order Document</Label>
                          <div className="border rounded-md p-2">
                            <UploadFile
                              type="order"
                              noticeId={noticeId}
                              clientName={notice.client?.name || ""}
                              noticeHeading={notice.heading || ""}
                              sectionHeading={order.heading}
                              onFileUpload={(url) => setOrderFileUrl(url)}
                            />
                            {orderFileUrl && (
                              <p className="text-xs text-green-600 mt-1">
                                <FileIcon className="inline-block w-3 h-3 mr-1" />
                                File uploaded successfully
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handleSubmitOrder}
                          disabled={!order.heading || isSubmittingOrder}
                          className="w-full"
                        >
                          {isSubmittingOrder ? (
                            <>
                              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <PlusIcon className="mr-2 h-4 w-4" />
                              Add Order
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="received-notices" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Received Notices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notice.receivedNotices?.length > 0 ? (
                      <div className="space-y-4">
                        {notice.receivedNotices.map((rn: any, index: number) => (
                          <div
                            key={rn._id || `received-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg gap-2"
                          >
                            <div>
                              <p className="font-medium">{rn.heading}</p>
                              <p className="text-sm text-muted-foreground">
                                Received: {formatDisplayDate(rn.receivingDate)} | Due: {formatDisplayDate(rn.dueDate)} |
                                Hearing: {rn.hearingDate ? formatDisplayDate(rn.hearingDate) : "N/A"}
                              </p>
                            </div>
                            {rn.fileUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={rn.fileUrl} target="_blank" rel="noopener noreferrer">
                                  View File
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No received notices found.</p>
                    )}

                    <Separator className="my-6" />

                    {/* Add Received Notice Form */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Add Received Notice</h4>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="notice-heading">Heading</Label>
                          <Input
                            id="notice-heading"
                            placeholder="Enter heading"
                            value={receivedNotice.heading}
                            onChange={(e) => setReceivedNotice({ ...receivedNotice, heading: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="notice-receiving-date">Receiving Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="notice-receiving-date"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !receivedNoticeReceivingDate && "text-muted-foreground",
                                  )}
                                  onClick={(e) => {
                                    // Prevent default behavior to help with iOS Safari
                                    e.preventDefault()
                                    // Force focus on the button
                                    e.currentTarget.focus()
                                  }}
                                  onTouchStart={(e) => {
                                    // Prevent default for touch events
                                    e.preventDefault()
                                    // Force focus
                                    e.currentTarget.focus()
                                  }}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {receivedNoticeReceivingDate ? (
                                    format(receivedNoticeReceivingDate, "dd/MM/yyyy")
                                  ) : (
                                    <span>Select date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                                sideOffset={8}
                                side="bottom"
                                avoidCollisions={false}
                                onInteractOutside={(e) => {
                                  // Prevent closing when interacting with date elements
                                  if ((e.target as HTMLElement).closest('[role="dialog"]')) {
                                    e.preventDefault()
                                  }
                                }}
                              >
                                <div className="z-50 bg-background border rounded-md shadow-md">
                                  <Calendar
                                    mode="single"
                                    selected={receivedNoticeReceivingDate}
                                    onSelect={(date) =>
                                      handleDateChange(date, "noticeReceivingDate", setReceivedNoticeReceivingDate)
                                    }
                                    initialFocus
                                    disabled={(date) => date < new Date("1900-01-01")}
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="notice-due-date" className="flex items-center gap-1">
                              Due Date
                              <span className="text-xs text-muted-foreground">(Optional)</span>
                            </Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="notice-due-date"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !receivedNoticeDueDate && "text-muted-foreground",
                                  )}
                                  onClick={(e) => {
                                    // Prevent default behavior to help with iOS Safari
                                    e.preventDefault()
                                    // Force focus on the button
                                    e.currentTarget.focus()
                                  }}
                                  onTouchStart={(e) => {
                                    // Prevent default for touch events
                                    e.preventDefault()
                                    // Force focus
                                    e.currentTarget.focus()
                                  }}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {receivedNoticeDueDate ? (
                                    format(receivedNoticeDueDate, "dd/MM/yyyy")
                                  ) : (
                                    <span>Select date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                                sideOffset={8}
                                side="bottom"
                                avoidCollisions={false}
                                onInteractOutside={(e) => {
                                  // Prevent closing when interacting with date elements
                                  if ((e.target as HTMLElement).closest('[role="dialog"]')) {
                                    e.preventDefault()
                                  }
                                }}
                              >
                                <div className="z-50 bg-background border rounded-md shadow-md">
                                  <Calendar
                                    mode="single"
                                    selected={receivedNoticeDueDate}
                                    onSelect={(date) =>
                                      handleDateChange(date, "noticeDueDate", setReceivedNoticeDueDate)
                                    }
                                    initialFocus
                                    disabled={(date) => date < new Date("1900-01-01")}
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Upload Document</Label>
                          <div className="border rounded-md p-2">
                            <UploadFile
                              type="received-notice"
                              noticeId={noticeId}
                              clientName={notice.client?.name || ""}
                              noticeHeading={notice.heading || ""}
                              sectionHeading={receivedNotice.heading}
                              onFileUpload={(url) => setReceivedNoticeFileUrl(url)}
                            />
                            {receivedNoticeFileUrl && (
                              <p className="text-xs text-green-600 mt-1">
                                <FileIcon className="inline-block w-3 h-3 mr-1" />
                                File uploaded successfully
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handleSubmitReceivedNotice}
                          disabled={
                            !receivedNotice.heading || !receivedNotice.receivingDate || isSubmittingReceivedNotice
                          }
                          className="w-full"
                        >
                          {isSubmittingReceivedNotice ? (
                            <>
                              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <PlusIcon className="mr-2 h-4 w-4" />
                              Add Received Notice
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

