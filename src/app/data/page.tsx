"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Folder,
  File,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  Home,
  ChevronRight,
  FolderPlus,
  Search,
  Loader2,
  Download,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DataItem {
  _id: string
  name: string
  type: "folder" | "file"
  parentId: string | null
  fileUrl?: string
  createdAt: string
}

export default function DataPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get("folder") || null

  const [data, setData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([])
  const [newFolderName, setNewFolderName] = useState("")
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch data for current folder
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/data${folderId ? `?parentId=${folderId}` : ""}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) throw new Error("Failed to fetch data")

        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load files and folders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [folderId, refreshTrigger])

  // Build breadcrumbs
  useEffect(() => {
    const buildBreadcrumbs = async () => {
      const crumbs = [{ id: null, name: "Home" }]

      if (folderId) {
        try {
          let currentId = folderId
          const breadcrumbItems = []

          while (currentId) {
            const response = await fetch(`/api/data/${currentId}`, {
              headers: {
                "Content-Type": "application/json",
              },
            })

            if (!response.ok) break

            const folder = await response.json()
            breadcrumbItems.unshift({ id: folder._id, name: folder.name })
            currentId = folder.parentId
          }

          setBreadcrumbs([...crumbs, ...breadcrumbItems])
        } catch (error) {
          console.error("Error building breadcrumbs:", error)
        }
      } else {
        setBreadcrumbs(crumbs)
      }
    }

    buildBreadcrumbs()
  }, [folderId])

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    setIsCreatingFolder(true)
    try {
      const response = await fetch("/api/data/folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFolderName,
          parentId: folderId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      const newFolder = await response.json()
      setData([...data, newFolder])
      setNewFolderName("")
      setFolderDialogOpen(false)
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
    } catch (error) {
      console.error("Error creating folder:", error)
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      })
    } finally {
      setIsCreatingFolder(false)
    }
  }

  // Upload file
  const handleFileUpload = async () => {
    if (!fileToUpload) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", fileToUpload)
    formData.append("parentId", folderId || "")

    try {
      const response = await fetch("/api/data/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload file")

      const newFile = await response.json()
      setData([...data, newFile])
      setFileToUpload(null)
      setUploadDialogOpen(false)
      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Delete item (file or folder)
  const handleDelete = async (id: string, type: "folder" | "file") => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const response = await fetch(`/api/data/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error(`Failed to delete ${type}`)

      setData(data.filter((item) => item._id !== id))
      toast({
        title: "Success",
        description: `${type === "folder" ? "Folder" : "File"} deleted successfully`,
      })
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive",
      })
    }
  }

  // Download file
  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) return

    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Navigate to folder
  const navigateToFolder = (id: string) => {
    router.push(`/data?folder=${id}`)
  }

  // Navigate to breadcrumb
  const navigateToBreadcrumb = (id: string | null) => {
    if (id === null) {
      router.push("/data")
    } else {
      router.push(`/data?folder=${id}`)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Filter data based on search query
  const filteredData = data.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Separate folders and files
  const folders = filteredData.filter((item) => item.type === "folder")
  const files = filteredData.filter((item) => item.type === "file")

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Breadcrumb Navigation */}
      <Card className="border shadow-sm bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                  <Button
                    variant={index === breadcrumbs.length - 1 ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 ${index === 0 ? "pl-2" : ""} ${index === breadcrumbs.length - 1 ? "font-medium" : ""}`}
                    onClick={() => navigateToBreadcrumb(crumb.id)}
                  >
                    {index === 0 ? (
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4 mr-1" />
                        {crumb.name}
                      </div>
                    ) : (
                      <span>{crumb.name}</span>
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleRefresh} variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <Button
                      onClick={handleCreateFolder}
                      disabled={isCreatingFolder || !newFolderName.trim()}
                      className="w-full"
                    >
                      {isCreatingFolder ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Folder"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Upload className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                    {fileToUpload && <p className="text-sm text-muted-foreground">Selected: {fileToUpload.name}</p>}
                    <Button onClick={handleFileUpload} disabled={isUploading || !fileToUpload} className="w-full">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload File"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Content */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg">
              {folderId ? breadcrumbs[breadcrumbs.length - 1]?.name : "All Files"}
            </CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files & folders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Folders</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-[80px] w-full rounded-lg" />
                    ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Files</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-[80px] w-full rounded-lg" />
                    ))}
                </div>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-lg border border-dashed border-muted">
              <File className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-base font-medium mb-1">No items found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "No matching files or folders found" : "This folder is empty"}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFolderDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Folder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folders Section */}
              {folders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Folders</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {folders.map((folder) => (
                      <Card
                        key={folder._id}
                        className="group overflow-hidden transition-all hover:shadow-md border border-border/40 hover:border-blue-200 dark:hover:border-blue-800"
                      >
                        <CardContent className="p-0">
                          <div
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => navigateToFolder(folder._id)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="rounded-full p-2 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex-shrink-0">
                                <Folder className="h-5 w-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-medium truncate" title={folder.name}>
                                  {folder.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(folder.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(folder._id, "folder")
                                    }}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete folder</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Files</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {files.map((file) => (
                      <Card
                        key={file._id}
                        className="group overflow-hidden transition-all hover:shadow-md border border-border/40 hover:border-purple-200 dark:hover:border-purple-800"
                      >
                        <CardContent className="p-0">
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="rounded-full p-2 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex-shrink-0">
                                <File className="h-5 w-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-medium truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {file.fileUrl && (
                                  <DropdownMenuItem
                                    onClick={() => handleDownload(file.fileUrl!, file.name)}
                                    className="cursor-pointer"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                )}
                                {file.fileUrl && (
                                  <DropdownMenuItem
                                    onClick={() => window.open(file.fileUrl, "_blank")}
                                    className="cursor-pointer"
                                  >
                                    <File className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(file._id, "file")}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

