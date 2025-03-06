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
import { CalendarIcon, FileTextIcon, UserIcon } from "lucide-react"

interface AddNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  refreshNotices: () => void
}

export default function AddNoticeModal({ open, onOpenChange, refreshNotices }: AddNoticeModalProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<{ _id: string; name: string }[]>([])
  const [fileUrl, setFileUrl] = useState<string>("") // ✅ Store fileUrl
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    client: "",
    heading: "",
    commissioner: "",
    taxAuthority: "",
    taxYear: "",
    receivingDate: "",
    dueDate: "",
    hearingDate: "",
    status: "Pending",
  })

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
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

      setIsSubmitting(true)
      const newNotice = await axiosInstance.post("/notices", { ...formData, fileUrl })

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Notice</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              <span>Notice Details</span>
            </TabsTrigger>
            <TabsTrigger value="dates" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Important Dates</span>
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Document</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Dropdown */}
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, client: value })}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
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
                    <Input id="receivingDate" name="receivingDate" type="date" onChange={handleChange} />
                  </div>

                  {/* Due Date */}
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate" className="font-medium">
                      Due Date
                    </Label>
                    <Input id="dueDate" name="dueDate" type="date" onChange={handleChange} />
                  </div>

                  {/* Hearing Date */}
                  <div className="grid gap-2">
                    <Label htmlFor="hearingDate" className="font-medium">
                      Hearing Date
                    </Label>
                    <Input id="hearingDate" name="hearingDate" type="date" onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="document">
            <Card>
              <CardContent className="pt-6">
                <Label className="text-base font-medium mb-4 block">Attach Notice Document</Label>
                <UploadFile type="notice" noticeId={formData.client} onFileUpload={(url) => setFileUrl(url)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Notice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

