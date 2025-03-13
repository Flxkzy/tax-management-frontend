"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import NoticeDetails from "@/components/notices/NoticeDetails"
import axiosInstance from "@/utils/axiosInstance"
import { cn } from "@/lib/utils"

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

export default function CalendarComponent() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)
  const [dateWithNotices, setDatesWithNotices] = useState<string[]>([])
  const [fetchingDates, setFetchingDates] = useState(false)
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Fetch dates with notices for the current month
  useEffect(() => {
    const fetchDatesWithNotices = async () => {
      try {
        setFetchingDates(true)
        const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd")
        const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd")

        try {
          // Try to fetch from the API
          const { data } = await axiosInstance.get(`/dashboard/notices/dates?start=${startDate}&end=${endDate}`)
          setDatesWithNotices(data.dates || [])
        } catch (apiError) {
          console.error("API endpoint not available:", apiError)
          // Fallback: Use an empty array if the API isn't implemented yet
          setDatesWithNotices([])
        }
      } catch (error) {
        console.error("Error in date fetching process:", error)
        setDatesWithNotices([])
      } finally {
        setFetchingDates(false)
      }
    }

    fetchDatesWithNotices()
  }, [currentMonth])

  // Fetch notices for selected date
  useEffect(() => {
    const fetchNoticesForDate = async () => {
      if (!selectedDate) return

      try {
        setLoading(true)
        const formattedDate = format(selectedDate, "yyyy-MM-dd")

        try {
          // Try to fetch from the API
          const { data } = await axiosInstance.get(`/dashboard/notices/date/${formattedDate}`)
          setNotices(data || [])
        } catch (apiError) {
          console.error("API endpoint not available:", apiError)
          // Fallback: Use an empty array if the API isn't implemented yet
          setNotices([])
        }
      } catch (error) {
        console.error("Error in notice fetching process:", error)
        setNotices([])
      } finally {
        setLoading(false)
      }
    }

    fetchNoticesForDate()
  }, [selectedDate])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Get day names for header with unique keys
  const dayNames = [
    { key: "sun", label: "Su" },
    { key: "mon", label: "Mo" },
    { key: "tue", label: "Tu" },
    { key: "wed", label: "We" },
    { key: "thu", label: "Th" },
    { key: "fri", label: "Fr" },
    { key: "sat", label: "Sa" },
  ]

  // Calculate empty cells before the first day of the month
  const firstDayOfMonth = startOfMonth(currentMonth).getDay()
  const emptyDays = Array(firstDayOfMonth).fill(null)

  const hasNotices = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    return dateWithNotices.includes(formattedDate)
  }

  const handleNoticeSelect = (noticeId: string) => {
    setSelectedNoticeId(noticeId)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedNoticeId(null)
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Calendar Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 border shadow-sm">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Calendar</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-6 w-6">
                <ChevronLeft className="h-3 w-3" />
                <span className="sr-only">Previous month</span>
              </Button>
              <div className="w-20 sm:w-24 text-center text-xs font-medium truncate">
                {format(currentMonth, "MMM yyyy")}
                <span className="hidden sm:inline">
                  {" "}
                  {/* Show full month name on larger screens */}
                  {format(currentMonth, " ")}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-6 w-6">
                <ChevronRight className="h-3 w-3" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day.key} className="text-center text-xs font-medium text-muted-foreground py-0.5">
                {day.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="h-7 rounded-md"></div>
            ))}
            {days.map((day) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isCurrentDay = isToday(day)
              const dayHasNotices = hasNotices(day)

              return (
                <Button
                  key={day.toString()}
                  variant="ghost"
                  className={cn(
                    "h-7 w-full rounded-md p-0 font-normal relative text-xs",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    !isCurrentMonth && "text-muted-foreground opacity-50",
                    isCurrentDay && !isSelected && "border border-primary text-primary",
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
                  {dayHasNotices && !fetchingDates && (
                    <div
                      className={cn(
                        "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-orange-500",
                      )}
                    />
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notices for Selected Date Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 border shadow-sm">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 max-w-[75%]">
              <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium truncate">
                {selectedDate ? `Notices: ${format(selectedDate, "MMM d, yyyy")}` : "Select a date"}
              </span>
            </div>
            {selectedDate && (
              <Badge variant="outline" className="text-xs font-normal flex-shrink-0">
                {loading ? "Loading..." : `${notices.length} notice${notices.length !== 1 ? "s" : ""}`}
              </Badge>
            )}
          </div>

          {selectedDate ? (
            loading ? (
              <div className="space-y-2">
                {Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
              </div>
            ) : notices.length > 0 ? (
              <div className="space-y-1.5 max-h-[160px] overflow-auto pr-1">
                {notices.map((notice) => (
                  <div
                    key={notice._id}
                    className="p-2 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleNoticeSelect(notice._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-xs line-clamp-1">{notice.heading}</h4>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(notice.dueDate).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs py-0 px-1.5 flex-shrink-0",
                          notice.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400",
                        )}
                      >
                        {notice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center bg-muted/20 rounded-lg border border-dashed">
                <AlertCircle className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-xs font-medium">No notices for this date</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center bg-muted/20 rounded-lg border border-dashed">
              <CalendarIcon className="h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xs font-medium">Select a date from the calendar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice Details Dialog */}
      {selectedNoticeId && (
        <NoticeDetails noticeId={selectedNoticeId} open={isDetailsOpen} onClose={handleCloseDetails} />
      )}
    </div>
  )
}

