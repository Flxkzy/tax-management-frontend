"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Trash2, UserCircle2, ArrowLeft, Users, Building2, User, Filter, X } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import NoticeList from "@/components/NoticeList"
import NoticeDetails from "@/components/notices/NoticeDetails"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Client {
  _id: string
  name: string
  type: string
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [name, setName] = useState("")
  const [type, setType] = useState("Individual")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // New state variables for notice integration
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string>("")
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [isNoticeDetailsOpen, setIsNoticeDetailsOpen] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await axiosInstance.get("/clients")
        setClients(data)
        setFilteredClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch clients. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [toast])

  useEffect(() => {
    let result = clients
    if (searchQuery) {
      result = result.filter((client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (selectedType !== "all") {
      result = result.filter((client) => client.type === selectedType)
    }
    setFilteredClients(result)
  }, [searchQuery, selectedType, clients])

  const handleAddClient = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a client name",
      })
      return
    }

    try {
      const { data } = await axiosInstance.post("/clients", { name, type })
      setClients([...clients, data.client])
      setIsDialogOpen(false)
      setName("")
      setType("Individual")
      toast({
        title: "Success",
        description: "Client added successfully",
      })
    } catch (error) {
      console.error("Error adding client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add client. Please try again.",
      })
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      await axiosInstance.delete(`/clients/${id}`)
      setClients(clients.filter((client) => client._id !== id))
      setClientToDelete(null)
      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete client. Please try again.",
      })
    }
  }

  // New handlers for notice integration
  const handleClientClick = (client: Client) => {
    setSelectedClientId(client._id)
    setSelectedClientName(client.name)
  }

  const handleBackToClients = () => {
    setSelectedClientId(null)
    setSelectedClientName("")
  }

  const handleSelectNotice = (noticeId: string) => {
    setSelectedNoticeId(noticeId)
    setIsNoticeDetailsOpen(true)
  }

  const handleCloseNoticeDetails = () => {
    setIsNoticeDetailsOpen(false)
    setSelectedNoticeId(null)
  }

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case "Individual":
        return <User className="h-4 w-4" />
      case "Company":
        return <Building2 className="h-4 w-4" />
      case "AOP":
        return <Users className="h-4 w-4" />
      default:
        return <UserCircle2 className="h-4 w-4" />
    }
  }

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case "Individual":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/20 dark:text-blue-400"
      case "Company":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-800/20 dark:text-purple-400"
      case "AOP":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/20 dark:text-green-400"
      default:
        return ""
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("all")
  }

  // Render client list view
  const renderClientList = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and their associated notices</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2 md:self-start">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px] gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="AOP">AOP</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || selectedType !== "all") && (
              <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {(searchQuery || selectedType !== "all") && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedType !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Type: {selectedType}
                <button onClick={() => setSelectedType("all")} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {filteredClients.length} {filteredClients.length === 1 ? "client" : "clients"} found
          </div>
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              List
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="gap-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClients.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <UserCircle2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No clients found</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    {searchQuery || selectedType !== "all"
                      ? "Try adjusting your search or filter criteria to find what you're looking for."
                      : "Start by adding a new client using the 'Add Client' button above."}
                  </p>
                  {(searchQuery || selectedType !== "all") && (
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <Card
                    key={client._id}
                    className="overflow-hidden transition-all hover:shadow-md border border-border/40 group"
                    onClick={() => handleClientClick(client)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {client.name}
                          </h3>
                          <Badge variant="secondary" className={`mt-1 ${getClientTypeColor(client.type)}`}>
                            <span className="flex items-center gap-1">
                              {getClientTypeIcon(client.type)}
                              {client.type}
                            </span>
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent triggering client click
                            setClientToDelete(client._id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="text-sm text-muted-foreground">Client ID: {client._id.slice(-6)}</div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        View Notices
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <UserCircle2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No clients found</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    {searchQuery || selectedType !== "all"
                      ? "Try adjusting your search or filter criteria to find what you're looking for."
                      : "Start by adding a new client using the 'Add Client' button above."}
                  </p>
                  {(searchQuery || selectedType !== "all") && (
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 text-sm font-medium grid grid-cols-12 gap-4">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-3">ID</div>
                    <div className="col-span-1"></div>
                  </div>
                  {filteredClients.map((client) => (
                    <div
                      key={client._id}
                      className="px-4 py-3 grid grid-cols-12 gap-4 items-center border-t hover:bg-muted/50 cursor-pointer group"
                      onClick={() => handleClientClick(client)}
                    >
                      <div className="col-span-5 font-medium group-hover:text-primary transition-colors truncate">
                        {client.name}
                      </div>
                      <div className="col-span-3">
                        <Badge variant="secondary" className={getClientTypeColor(client.type)}>
                          <span className="flex items-center gap-1">
                            {getClientTypeIcon(client.type)}
                            {client.type}
                          </span>
                        </Badge>
                      </div>
                      <div className="col-span-3 text-sm text-muted-foreground">{client._id.slice(-6)}</div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setClientToDelete(client._id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )

  // Render notices for selected client
  const renderClientNotices = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleBackToClients} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedClientName}</h1>
            <p className="text-sm text-muted-foreground">Manage notices for this client</p>
          </div>
        </div>
        <Button variant="outline" className="mt-2 md:mt-0 gap-2" onClick={handleBackToClients}>
          <Users className="h-4 w-4" />
          Back to All Clients
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <NoticeList clientId={selectedClientId!} onSelectNotice={handleSelectNotice} className="w-full" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6 md:py-8">
        {selectedClientId ? renderClientNotices() : renderClientList()}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Enter the client details below to create a new client record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                placeholder="Enter client name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Client Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="focus-visible:ring-primary">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Individual
                    </div>
                  </SelectItem>
                  <SelectItem value="AOP">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      AOP
                    </div>
                  </SelectItem>
                  <SelectItem value="Company">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Confirmation */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notice Details Dialog */}
      {selectedNoticeId && (
        <NoticeDetails noticeId={selectedNoticeId} open={isNoticeDetailsOpen} onClose={handleCloseNoticeDetails} />
      )}
    </div>
  )
}

