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

interface NoticeDetailsProps {
  noticeId: string
  open: boolean
  onClose: () => void
}

export default function NoticeDetails({ noticeId, open, onClose }: NoticeDetailsProps) {
  const { toast } = useToast()
  const [notice, setNotice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState({ heading: "", replyDate: "" })
  const [order, setOrder] = useState({ heading: "", receivingDate: "" })
  const [receivedNotice, setReceivedNotice] = useState({ heading: "", dueDate: "", hearingDate: "" })
  const [replyFileUrl, setReplyFileUrl] = useState<string>("")
  const [orderFileUrl, setOrderFileUrl] = useState<string>("")
  const [receivedNoticeFileUrl, setReceivedNoticeFileUrl] = useState<string>("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [isSubmittingReceivedNotice, setIsSubmittingReceivedNotice] = useState(false)

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

  const handleSubmitReceivedNotice = async () => {
    try {
      if (!receivedNoticeFileUrl) {
        toast({ variant: "destructive", title: "Error", description: "Please upload a file first." })
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

      setReceivedNotice({ heading: "", dueDate: "", hearingDate: "" })
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

      setOrder({ heading: "", receivingDate: "" })
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
              <CardContent className="grid grid-cols-2 gap-4">
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
                <div className="col-span-2 mt-2 flex justify-end">
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
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Receiving Date</Label>
                  <p className="font-medium">{new Date(notice.receivingDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p className="font-medium flex items-center">
                    {new Date(notice.dueDate).toLocaleDateString()}
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
                  <p className="font-medium">
                    {notice.hearingDate ? new Date(notice.hearingDate).toLocaleDateString() : "N/A"}
                  </p>
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
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{reply.heading}</p>
                              <p className="text-sm text-muted-foreground">
                                <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                                {new Date(reply.replyDate).toLocaleDateString()}
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
                          <Input
                            id="reply-date"
                            type="date"
                            value={reply.replyDate}
                            onChange={(e) => setReply({ ...reply, replyDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Upload Reply Document</Label>
                          <div className="border rounded-md p-2">
                            <UploadFile type="reply" noticeId={noticeId} onFileUpload={(url) => setReplyFileUrl(url)} />
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
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{order.heading}</p>
                              {order.receivingDate && (
                                <p className="text-sm text-muted-foreground">
                                  <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                                  {new Date(order.receivingDate).toLocaleDateString()}
                                </p>
                              )}
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
                        <div className="grid gap-2">
                          <Label>Receiving Date</Label>
                          <Input
                            type="date"
                            value={order.receivingDate}
                            onChange={(e) => setOrder({ ...order, receivingDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Upload Order Document</Label>
                          <div className="border rounded-md p-2">
                            <UploadFile type="order" noticeId={noticeId} onFileUpload={(url) => setOrderFileUrl(url)} />
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
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{rn.heading}</p>
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(rn.dueDate).toLocaleDateString()} | Hearing:{" "}
                                {rn.hearingDate ? new Date(rn.hearingDate).toLocaleDateString() : "N/A"}
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

                    {/* ✅ Add Received Notice Form */}
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
                        <div className="grid gap-2">
                          <Label htmlFor="notice-due-date">Due Date</Label>
                          <Input
                            id="notice-due-date"
                            type="date"
                            value={receivedNotice.dueDate}
                            onChange={(e) => setReceivedNotice({ ...receivedNotice, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="notice-hearing-date">Hearing Date</Label>
                          <Input
                            id="notice-hearing-date"
                            type="date"
                            value={receivedNotice.hearingDate}
                            onChange={(e) => setReceivedNotice({ ...receivedNotice, hearingDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Upload Document</Label>
                          <div className="border rounded-md p-2">
                            <UploadFile
                              type="received-notice"
                              noticeId={noticeId}
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
                          disabled={!receivedNotice.heading || !receivedNotice.dueDate || isSubmittingReceivedNotice}
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

