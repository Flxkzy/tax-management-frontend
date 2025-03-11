"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axiosInstance from "@/utils/axiosInstance"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import UploadFile from "@/components/notices/UploadFile"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, FileTextIcon, UserIcon, Loader2, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface EditNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  refreshNotices: () => void
  noticeId: string
}

export default function EditNoticeModal({ open, onOpenChange, refreshNotices, noticeId }: EditNoticeModalProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<{ _id: string; name: string }[]>([])
  const [fileUrl, setFileUrl] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    client: "",
    heading: "",
    commissioner: "",
    taxAuthority: "",
    taxYear: "",
    receivingDate: "",
    taxOffice: "",
    dueDate: "",
    hearingDate: "",
    status: "Pending",
    fileUrl: "",
  })

  // For date picker state
  const [receivingDate, setReceivingDate] = useState<Date | undefined>(undefined)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [hearingDate, setHearingDate] = useState<Date | undefined>(undefined)

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
    const fetchClients = async () => {
      try {
        const { data } = await axiosInstance.get("/clients")
        setClients(data)
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch clients." })
      }
    }
    fetchClients()
  }, [toast])

  useEffect(() => {
    const fetchNoticeDetails = async () => {
      if (!noticeId || !open) return

      try {
        setLoading(true)
        const { data } = await axiosInstance.get(`/notices/${noticeId}`)

        // Parse dates for calendar picker
        const parseDate = (dateString: string) => {
          if (!dateString) return undefined
          return new Date(dateString)
        }

        // Set date objects for calendar pickers
        const receivingDateObj = parseDate(data.receivingDate)
        const dueDateObj = parseDate(data.dueDate)
        const hearingDateObj = parseDate(data.hearingDate)

        setReceivingDate(receivingDateObj)
        setDueDate(dueDateObj)
        setHearingDate(hearingDateObj)

        // Format dates for backend (YYYY-MM-DD)
        const formatDateForBackend = (dateString: string) => {
          if (!dateString) return ""
          const date = new Date(dateString)
          return format(date, "yyyy-MM-dd")
        }

        setFormData({
          client: data.client?._id || "",
          heading: data.heading || "",
          commissioner: data.commissioner || "",
          taxAuthority: data.taxAuthority || "",
          taxYear: data.taxYear || "",
          receivingDate: formatDateForBackend(data.receivingDate),
          taxOffice: data.taxOffice || "",
          dueDate: formatDateForBackend(data.dueDate),
          hearingDate: formatDateForBackend(data.hearingDate),
          status: data.status || "Pending",
          fileUrl: data.fileUrl || "",
        })

        setFileUrl(data.fileUrl || "")
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch notice details." })
      } finally {
        setLoading(false)
      }
    }

    fetchNoticeDetails()
  }, [noticeId, open, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle date selection from calendar
  const handleDateChange = (date: Date | undefined, field: "receivingDate" | "dueDate" | "hearingDate") => {
    if (field === "receivingDate") setReceivingDate(date)
    if (field === "dueDate") setDueDate(date)
    if (field === "hearingDate") setHearingDate(date)

    if (date) {
      // Format date as YYYY-MM-DD for backend
      const formattedDate = format(date, "yyyy-MM-dd")
      setFormData((prev) => ({ ...prev, [field]: formattedDate }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.client || !formData.heading || !formData.receivingDate) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields (Client, Heading, Receiving Date).",
        })
        return
      }

      setIsSubmitting(true)
      // Only update fileUrl if a new one was uploaded
      const updateData = { ...formData }
      if (fileUrl && fileUrl !== formData.fileUrl) {
        updateData.fileUrl = fileUrl
      }

      await axiosInstance.put(`/notices/${noticeId}`, updateData)

      toast({ title: "Success", description: "Notice updated successfully" })
      refreshNotices()
      onOpenChange(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update notice." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Loading Notice Details...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Notice</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)]">
          <div className="pr-4">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Notice Details</span>
                  <span className="sm:hidden">Details</span>
                </TabsTrigger>
                <TabsTrigger value="dates" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Important Dates</span>
                  <span className="sm:hidden">Dates</span>
                </TabsTrigger>
                <TabsTrigger value="document" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Document</span>
                  <span className="sm:hidden">Doc</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* Client & Tax Authority - Stack on mobile, side by side on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Dropdown */}
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                      value={formData.client}
                      onValueChange={(value) => setFormData({ ...formData, client: value })}
                    >
                      <SelectTrigger id="client" className="truncate">
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id} className="truncate">
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tax Authority */}
                  <div className="grid gap-2">
                    <Label htmlFor="taxAuthority">Tax Authority</Label>
                    <Select
                      value={formData.taxAuthority}
                      onValueChange={(value) => setFormData({ ...formData, taxAuthority: value })}
                    >
                      <SelectTrigger id="taxAuthority">
                        <SelectValue placeholder="Select Tax Authority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FBR">FBR</SelectItem>
                        <SelectItem value="PRA">PRA</SelectItem>
                        <SelectItem value="SRB">SRB</SelectItem>
                        <SelectItem value="KPKRA">KPKRA</SelectItem>
                        <SelectItem value="BRA">BRA</SelectItem>
                        <SelectItem value="AJKRA">AJKRA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tax Office */}
                  <div className="grid gap-2">
                    <Label htmlFor="taxOffice">Tax Office</Label>
                    <Select
                      value={formData.taxOffice}
                      onValueChange={(value) => setFormData({ ...formData, taxOffice: value })}
                    >
                      <SelectTrigger id="taxOffice">
                        <SelectValue placeholder="Select Tax Office" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LTO">LTO</SelectItem>
                        <SelectItem value="RTO">RTO</SelectItem>
                        <SelectItem value="CTO">CTO</SelectItem>
                        <SelectItem value="CIR(A)">CIR(A)</SelectItem>
                        <SelectItem value="ATIR">ATIR</SelectItem>
                        <SelectItem value="HIGH COURT">HIGH COURT</SelectItem>
                        <SelectItem value="SUPREME COURT">SUPREME COURT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Heading */}
                <div className="grid gap-2">
                  <Label htmlFor="heading">Notice Heading</Label>
                  <Input
                    id="heading"
                    name="heading"
                    value={formData.heading}
                    placeholder="Enter Notice Heading"
                    onChange={handleChange}
                  />
                </div>

                {/* Commissioner & Tax Year - Stack on mobile, side by side on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Commissioner */}
                  <div className="grid gap-2">
                    <Label htmlFor="commissioner">Commissioner</Label>
                    <Input
                      id="commissioner"
                      name="commissioner"
                      value={formData.commissioner}
                      placeholder="Enter Commissioner Name"
                      onChange={handleChange}
                    />
                  </div>

                  {/* Tax Year */}
                  <div className="grid gap-2">
                    <Label htmlFor="taxYear">Tax Year</Label>
                    <Input
                      id="taxYear"
                      name="taxYear"
                      value={formData.taxYear}
                      placeholder="e.g. 2024"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    {/* Stack all date fields on mobile, 3 columns on larger screens */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Receiving Date */}
                      <div className="grid gap-2">
                        <Label htmlFor="receivingDate" className="font-medium">
                          Receiving Date
                        </Label>
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !receivingDate && "text-muted-foreground",
                                  receivingDate && "pr-8", // Add padding for the clear button
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
                                {receivingDate ? format(receivingDate, "dd/MM/yyyy") : <span>Select date</span>}
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
                                  selected={receivingDate}
                                  onSelect={(date) => handleDateChange(date, "receivingDate")}
                                  initialFocus
                                  disabled={(date) => date < new Date("1900-01-01")}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          {receivingDate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full rounded-l-none"
                              onClick={() => handleDateChange(undefined, "receivingDate")}
                              title="Clear date"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Clear date</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate" className="font-medium flex items-center gap-1">
                          Due Date
                          <span className="text-xs text-muted-foreground">(Optional)</span>
                        </Label>
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dueDate && "text-muted-foreground",
                                  dueDate && "pr-8", // Add padding for the clear button
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
                                {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Select date</span>}
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
                                  selected={dueDate}
                                  onSelect={(date) => handleDateChange(date, "dueDate")}
                                  initialFocus
                                  disabled={(date) => date < new Date("1900-01-01")}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          {dueDate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full rounded-l-none"
                              onClick={() => handleDateChange(undefined, "dueDate")}
                              title="Clear date"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Clear date</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Hearing Date */}
                      <div className="grid gap-2">
                        <Label htmlFor="hearingDate" className="font-medium flex items-center gap-1">
                          Hearing Date
                          <span className="text-xs text-muted-foreground">(Optional)</span>
                        </Label>
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !hearingDate && "text-muted-foreground",
                                  hearingDate && "pr-8", // Add padding for the clear button
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
                                {hearingDate ? format(hearingDate, "dd/MM/yyyy") : <span>Select date</span>}
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
                                  selected={hearingDate}
                                  onSelect={(date) => handleDateChange(date, "hearingDate")}
                                  initialFocus
                                  disabled={(date) => date < new Date("1900-01-01")}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          {hearingDate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full rounded-l-none"
                              onClick={() => handleDateChange(undefined, "hearingDate")}
                              title="Clear date"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Clear date</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="document">
                <Card>
                  <CardContent className="pt-6">
                    <Label className="text-base font-medium mb-4 block">Attach Notice Document</Label>
                    {fileUrl && (
                      <div className="mb-4 p-2 bg-muted rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-sm truncate max-w-full">Current document attached</span>
                        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      </div>
                    )}
                    <UploadFile
                      type="notice"
                      noticeId={noticeId}
                      clientName={clients.find((c) => c._id === formData.client)?.name || ""}
                      noticeHeading={formData.heading}
                      onFileUpload={(url) => setFileUrl(url)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload a new file only if you want to replace the existing one.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Notice"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

