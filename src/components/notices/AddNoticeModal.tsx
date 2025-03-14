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

interface AddNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  refreshNotices: () => void
}

export default function AddNoticeModal({ open, onOpenChange, refreshNotices }: AddNoticeModalProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<{ _id: string; name: string }[]>([])
  const [fileUrl, setFileUrl] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    client: "",
    heading: "",
    commissioner: "",
    taxAuthority: "",
    taxYear: "",
    taxOffice: "", // Add this line
    receivingDate: "",
    dueDate: "",
    hearingDate: "",
    status: "Pending",
  })

  // For date picker state
  const [receivingDate, setReceivingDate] = useState<Date | undefined>(undefined)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [hearingDate, setHearingDate] = useState<Date | undefined>(undefined)

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = async () => {
    try {
      if (!fileUrl) {
        toast({ variant: "destructive", title: "Error", description: "Please upload a file first." })
        return
      }

      if (!formData.client || !formData.heading || !formData.receivingDate) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields (Client, Heading, Receiving Date).",
        })
        return
      }

      setIsSubmitting(true)
      await axiosInstance.post("/notices", { ...formData, fileUrl })

      toast({ title: "Success", description: "Notice added successfully" })
      refreshNotices()
      onOpenChange(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add notice." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Notice</DialogTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Dropdown */}
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, client: value })}>
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
                    <Select onValueChange={(value) => setFormData({ ...formData, taxAuthority: value })}>
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
                    <Select onValueChange={(value) => setFormData({ ...formData, taxOffice: value })}>
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
                  <Input id="heading" name="heading" placeholder="Enter Notice Heading" onChange={handleChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Commissioner */}
                  <div className="grid gap-2">
                    <Label htmlFor="commissioner">Commissioner</Label>
                    <Input
                      id="commissioner"
                      name="commissioner"
                      placeholder="Enter Commissioner Name"
                      onChange={handleChange}
                    />
                  </div>

                  {/* Tax Year */}
                  <div className="grid gap-2">
                    <Label htmlFor="taxYear">Tax Year</Label>
                    <Input id="taxYear" name="taxYear" placeholder="e.g. 2024" onChange={handleChange} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
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
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {receivingDate ? format(receivingDate, "dd/MM/yyyy") : <span>Select date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={receivingDate}
                                onSelect={(date) => handleDateChange(date, "receivingDate")}
                                initialFocus
                              />
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
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Select date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={(date) => handleDateChange(date, "dueDate")}
                                initialFocus
                              />
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
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {hearingDate ? format(hearingDate, "dd/MM/yyyy") : <span>Select date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={hearingDate}
                                onSelect={(date) => handleDateChange(date, "hearingDate")}
                                initialFocus
                              />
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
                    <UploadFile
                      type="notice"
                      noticeId={formData.client}
                      clientName={clients.find((c) => c._id === formData.client)?.name || ""}
                      noticeHeading={formData.heading}
                      onFileUpload={(url) => setFileUrl(url)}
                    />
                    {fileUrl && <p className="text-xs text-green-600 mt-2">File uploaded successfully</p>}
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
                Submitting...
              </>
            ) : (
              "Submit Notice"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

