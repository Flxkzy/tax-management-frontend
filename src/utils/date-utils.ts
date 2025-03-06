export function isWithinWeek(date: string): boolean {
  const today = new Date()
  const targetDate = new Date(date)
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return targetDate > today && targetDate <= weekFromNow
}

export function isWithinMonth(date: string): boolean {
  const today = new Date()
  const targetDate = new Date(date)
  const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  return targetDate > today && targetDate <= monthFromNow
}

export function isOverdue(date: string): boolean {
  return new Date(date) < new Date()
}

