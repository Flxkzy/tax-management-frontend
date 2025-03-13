"use client"

import { useEffect, useState } from "react"
import { Inbox, Plus, Filter } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { Button } from "@/components/ui/button"
import NoticeList from "@/components/NoticeList"
import AddNoticeModal from "@/components/notices/AddNoticeModal"
import NoticeDetails from "@/components/notices/NoticeDetails"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { AxiosError } from "axios" // ✅ Import AxiosError

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// ✅ Define Notice and Client types
interface Notice {
  _id: string
  heading: string
  taxYear: string
  dueDate: string // ✅ Add this field
  status: "Pending" | "Completed" // ✅ Add this field
  client: { _id: string; name: string }
}

interface Client {
  _id: string
  name: string
}

export default function NoticesPage() {
  const { toast } = useToast()
  const [notices, setNotices] = useState<Notice[]>([]) // ✅ Ensure correct type
  const [clients, setClients] = useState<Client[]>([]) // ✅ Ensure correct type
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>("")
  const [selectedTaxOffice, setSelectedTaxOffice] = useState<string>("")

  useEffect(() => {
    fetchClients()
    fetchNotices()
  }, [selectedClient, selectedTaxYear, selectedTaxOffice])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      let endpoint = "/notices"
      const filters: string[] = []

      if (selectedClient && selectedClient !== "all" && selectedClient.trim() !== "") {
        filters.push(`client=${encodeURIComponent(selectedClient)}`)
      }

      if (selectedTaxYear && selectedTaxYear !== "all" && selectedTaxYear.trim() !== "") {
        filters.push(`taxYear=${encodeURIComponent(selectedTaxYear)}`)
      }

      if (selectedTaxOffice && selectedTaxOffice !== "all" && selectedTaxOffice.trim() !== "") {
        filters.push(`taxOffice=${encodeURIComponent(selectedTaxOffice)}`)
      }

      if (filters.length > 0) {
        endpoint += `?${filters.join("&")}`
      }

      console.log("🚀 Fetching Notices from API:", endpoint) // ✅ Debugging log

      const response = await axiosInstance.get(endpoint)
      console.log("✅ Filtered Notices Response:", response.data.notices) // ✅ Log notices data

      setNotices(response.data.notices) // ✅ Update the state with filtered results
    } catch (err: unknown) {
      const error = err as AxiosError
      console.error("❌ Error fetching notices:", error.message)
      console.log("🛑 API Error Response:", error.response?.data || "No response data")
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch notices." })
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const { data } = await axiosInstance.get("/clients")
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch clients." })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-6 rounded-lg border shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notices Management</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              View and manage all tax notices, replies, and orders
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto" size="lg" variant="default">
            <Plus className="mr-2 h-5 w-5" /> Add New Notice
          </Button>
        </div>

        <Separator />

        {/* Filters Section */}
        <Card className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Filter Notices</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="client-filter" className="text-sm font-medium">
                  Client
                </label>
                <Select
                  value={selectedClient || "all"}
                  onValueChange={(value) => setSelectedClient(value === "all" ? "" : value)}
                >
                  <SelectTrigger id="client-filter" className="w-full">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="tax-year-filter" className="text-sm font-medium">
                  Tax Year
                </label>
                <Select
                  value={selectedTaxYear || "all"}
                  onValueChange={(value) => setSelectedTaxYear(value === "all" ? "" : value)}
                >
                  <SelectTrigger id="tax-year-filter" className="w-full">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {[...Array(10)].map((_, index) => {
                      const year = new Date().getFullYear() - index
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="tax-office-filter" className="text-sm font-medium">
                  Tax Office
                </label>
                <Select
                  value={selectedTaxOffice || "all"}
                  onValueChange={(value) => setSelectedTaxOffice(value === "all" ? "" : value)}
                >
                  <SelectTrigger id="tax-office-filter" className="w-full">
                    <SelectValue placeholder="All Tax Offices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tax Offices</SelectItem>
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
          </div>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-1/3 bg-muted animate-pulse rounded"></div>
                  <div className="h-6 w-1/4 bg-muted animate-pulse rounded"></div>
                </div>
                <Separator />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-1/2 bg-muted animate-pulse rounded"></div>
                      <div className="h-5 w-1/6 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-4 w-1/5 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-1/5 bg-muted animate-pulse rounded"></div>
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : notices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
              <div className="bg-muted/30 p-4 rounded-full mb-4">
                <Inbox className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Notices Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {selectedClient || selectedTaxYear || selectedTaxOffice
                  ? "No notices match your current filters. Try adjusting your selection."
                  : "There are no notices in the system yet. Add your first notice to get started."}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add New Notice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border bg-card">
            <NoticeList
              notices={notices}
              onSelectNotice={setSelectedNoticeId}
              selectedClient={selectedClient}
              selectedTaxYear={selectedTaxYear}
              selectedTaxOffice={selectedTaxOffice}
            />
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

