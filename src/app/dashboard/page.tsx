"use client"

import { useState, useEffect } from "react"
import axiosInstance from "@/utils/axiosInstance"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import NoticeDetails from "@/components/notices/NoticeDetails"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import CalendarComponent from "@/components/CalendarComponent";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  CalendarClock,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Info,
} from "lucide-react"

interface Notice {
  _id: string
  heading: string
  dueDate: string
  hearingDate?: string
  status: "Pending" | "Completed"
  client: {
    _id: string
    name: string
  }
}

interface DashboardStats {
  totalClients: number
  totalNotices: number
  pendingNotices: number
  completedNotices: number
  noticesByCategory: {
    pending: {
      thisWeek: Notice[]
      thisMonth: Notice[]
      overdue: Notice[]
    }
    hearing: {
      thisWeek: Notice[]
      thisMonth: Notice[]
      overdue: Notice[]
    }
  }
  latestCompletedNotices: Notice[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedNoticeType, setSelectedNoticeType] = useState<"pending" | "hearing">("pending")
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [progressValue, setProgressValue] = useState(0)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const { data } = await axiosInstance.get("/dashboard")
        setStats(data)
        // Calculate progress percentage
        const total = data.totalNotices
        const completed = data.completedNotices
        setProgressValue(total > 0 ? (completed / total) * 100 : 0)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCategorySelect = (category: string, type: "pending" | "hearing") => {
    setSelectedCategory(category)
    setSelectedNoticeType(type)
  }

  const handleNoticeSelect = (noticeId: string) => {
    setSelectedNoticeId(noticeId)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedNoticeId(null)
    // Refresh data when closing details
    handleRefresh()
  }

  const getNoticesForSelectedCategory = () => {
    if (!stats || !selectedCategory) return []

    let notices = []

    switch (selectedCategory) {
      case "thisWeek":
        notices = stats.noticesByCategory[selectedNoticeType].thisWeek
        // Filter out overdue notices from "thisWeek" category
        if (selectedNoticeType === "pending" || selectedNoticeType === "hearing") {
          notices = notices.filter((notice) => new Date(notice.dueDate) >= new Date())
        }
        return notices
      case "thisMonth":
        notices = stats.noticesByCategory[selectedNoticeType].thisMonth
        // Filter out overdue notices from "thisMonth" category
        if (selectedNoticeType === "pending" || selectedNoticeType === "hearing") {
          notices = notices.filter((notice) => new Date(notice.dueDate) >= new Date())
        }
        return notices
      case "overdue":
        return stats.noticesByCategory[selectedNoticeType].overdue
      default:
        return []
    }
  }

  const getCategoryCount = (category: string, type: "pending" | "hearing") => {
    if (!stats) return 0

    let notices = []

    switch (category) {
      case "thisWeek":
        notices = stats.noticesByCategory[type].thisWeek
        // Filter out overdue notices for count
        if (type === "pending" || type === "hearing") {
          notices = notices.filter((notice) => new Date(notice.dueDate) >= new Date())
        }
        return notices.length
      case "thisMonth":
        notices = stats.noticesByCategory[type].thisMonth
        // Filter out overdue notices for count
        if (type === "pending" || type === "hearing") {
          notices = notices.filter((notice) => new Date(notice.dueDate) >= new Date())
        }
        return notices.length
      case "overdue":
        return stats.noticesByCategory[type].overdue.length
      default:
        return 0
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your legal notices and hearings</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2 self-start">
          <RefreshCw className="h-4 w-4" />
          Refresh Dashboard
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="border shadow-sm bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Overall Progress</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Percentage of completed notices out of total notices</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-semibold">{progressValue.toFixed(1)}%</span>
          </div>
          <Progress
            value={progressValue}
            className="h-1.5 bg-muted/50 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-blue-500" />
              <span>Completed: {stats?.completedNotices || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-muted" />
              <span>Pending: {stats?.pendingNotices || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
        ) : (
          <>
            <Card className="overflow-hidden transition-all hover:shadow-md border border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <div className="rounded-full p-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-3">
                  <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Registered clients in the system</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md border border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
                <div className="rounded-full p-1.5 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <FileText className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-3">
                  <div className="text-2xl font-bold">{stats?.totalNotices || 0}</div>
                  <div className="text-xs text-muted-foreground">notices</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">All notices in the system</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md border border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Notices</CardTitle>
                <div className="rounded-full p-1.5 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                  <Clock className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-3">
                  <div className="text-2xl font-bold">{stats?.pendingNotices || 0}</div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Notices requiring action</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md border border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Notices</CardTitle>
                <div className="rounded-full p-1.5 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-3">
                  <div className="text-2xl font-bold">{stats?.completedNotices || 0}</div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Resolved
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Successfully resolved notices</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <CalendarComponent />

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Notices Section */}
        <Card className="col-span-1 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Notices
            </CardTitle>
            <CardDescription>Notices requiring action categorized by due date</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex items-center justify-between p-3.5 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-all hover:shadow-sm border border-transparent hover:border-border/50"
                        onClick={() => handleCategorySelect("thisWeek", "pending")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Due This Week</h3>
                            <p className="text-xs text-muted-foreground">Notices due in the current week</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xl font-bold">{getCategoryCount("thisWeek", "pending")}</span>
                            <span className="text-xs text-muted-foreground ml-1">notices</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Click to view notices due this week</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex items-center justify-between p-3.5 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-all hover:shadow-sm border border-transparent hover:border-border/50"
                        onClick={() => handleCategorySelect("thisMonth", "pending")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full p-1.5 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                            <CalendarClock className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Due This Month</h3>
                            <p className="text-xs text-muted-foreground">Notices due in the current month</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xl font-bold">{getCategoryCount("thisMonth", "pending")}</span>
                            <span className="text-xs text-muted-foreground ml-1">notices</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Click to view notices due this month</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex items-center justify-between p-3.5 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-all hover:shadow-sm border border-transparent hover:border-border/50"
                        onClick={() => handleCategorySelect("overdue", "pending")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full p-1.5 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Overdue</h3>
                            <p className="text-xs text-muted-foreground">Notices past their due date</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xl font-bold text-red-600 dark:text-red-400">
                              {getCategoryCount("overdue", "pending")}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">notices</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Click to view overdue notices</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hearing Notices Section */}
        <Card className="col-span-1 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Hearing Notices
            </CardTitle>
            <CardDescription>Notices with upcoming hearings categorized by date</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex items-center justify-between p-3.5 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-all hover:shadow-sm border border-transparent hover:border-border/50"
                        onClick={() => handleCategorySelect("thisWeek", "hearing")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Hearing This Week</h3>
                            <p className="text-xs text-muted-foreground">Hearings scheduled this week</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xl font-bold">{getCategoryCount("thisWeek", "hearing")}</span>
                            <span className="text-xs text-muted-foreground ml-1">hearings</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Click to view hearings this week</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex items-center justify-between p-3.5 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-all hover:shadow-sm border border-transparent hover:border-border/50"
                        onClick={() => handleCategorySelect("thisMonth", "hearing")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full p-1.5 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                            <CalendarClock className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Hearing This Month</h3>
                            <p className="text-xs text-muted-foreground">Hearings scheduled this month</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xl font-bold">{getCategoryCount("thisMonth", "hearing")}</span>
                            <span className="text-xs text-muted-foreground ml-1">hearings</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Click to view hearings this month</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex items-center justify-between p-3.5 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-all hover:shadow-sm border border-transparent hover:border-border/50"
                        onClick={() => handleCategorySelect("overdue", "hearing")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full p-1.5 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Overdue Hearings</h3>
                            <p className="text-xs text-muted-foreground">Hearings that have passed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xl font-bold text-red-600 dark:text-red-400">
                              {getCategoryCount("overdue", "hearing")}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">hearings</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Click to view overdue hearings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Notices List */}
      {selectedCategory && (
        <Card className="mt-6 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>
              {selectedNoticeType === "pending" ? "Pending Notices" : "Hearing Notices"} -
              {selectedCategory === "thisWeek"
                ? " Due This Week"
                : selectedCategory === "thisMonth"
                  ? " Due This Month"
                  : " Overdue"}
            </CardTitle>
            <CardDescription>
              {selectedNoticeType === "pending"
                ? `Notices ${selectedCategory === "overdue" ? "past their due date" : `due ${selectedCategory === "thisWeek" ? "this week" : "this month"}`}`
                : `Hearings ${selectedCategory === "overdue" ? "that have passed" : `scheduled ${selectedCategory === "thisWeek" ? "this week" : "this month"}`}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : getNoticesForSelectedCategory().length > 0 ? (
              <div className="space-y-4">
                {getNoticesForSelectedCategory().map((notice) => (
                  <div
                    key={notice._id}
                    className="group flex flex-col gap-2 rounded-lg border p-3.5 transition-all hover:bg-muted/40 hover:shadow-sm cursor-pointer border-border/40"
                    onClick={() => handleNoticeSelect(notice._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium leading-none text-base group-hover:text-primary transition-colors">
                          {notice.heading}
                        </h3>
                        <p className="text-xs text-muted-foreground">Client: {notice.client?.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          variant="secondary"
                          className={
                            notice.status === "Completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-950/30 dark:text-green-400 text-xs py-0.5"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 text-xs py-0.5"
                          }
                        >
                          {notice.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {selectedNoticeType === "pending"
                            ? `Due: ${notice.dueDate ? new Date(notice.dueDate).toLocaleDateString("en-GB") : "Not set"}`
                            : `Hearing: ${notice.hearingDate ? new Date(notice.hearingDate).toLocaleDateString("en-GB") : "Not set"}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/20 rounded-lg border border-dashed border-muted">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-base font-medium mb-1">No notices found</h3>
                <p className="text-sm text-muted-foreground">
                  There are no {selectedNoticeType === "pending" ? "pending notices" : "hearings"}{" "}
                  {selectedCategory === "thisWeek"
                    ? "due this week"
                    : selectedCategory === "thisMonth"
                      ? "due this month"
                      : "that are overdue"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notice Details Dialog */}
      {selectedNoticeId && (
        <NoticeDetails noticeId={selectedNoticeId} open={isDetailsOpen} onClose={handleCloseDetails} />
      )}
    </div>
  )
}

