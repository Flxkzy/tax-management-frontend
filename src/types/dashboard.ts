export interface Notice {
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

export interface CategorizedNotices {
  dueThisWeek: Notice[]
  dueThisMonth: Notice[]
  overdue: Notice[]
  hearingThisWeek: Notice[]
  hearingThisMonth: Notice[]
  overdueHearings: Notice[]
}

export interface StatsChange {
  value: number
  percentage: number
}

export interface DashboardStats {
  totalClients: number
  totalNotices: number
  pendingNotices: number
  completedNotices: number
  categorizedNotices: CategorizedNotices
  changes?: {
    clients: StatsChange
    notices: StatsChange
    pending: StatsChange
    completed: StatsChange
  }
  dueNotices: {
    thisWeek: number
    thisMonth: number
    overdue: number
  }
  hearingDates: {
    thisWeek: number
    thisMonth: number
    overdue: number
  }
}

