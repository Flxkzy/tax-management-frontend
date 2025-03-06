export function calculateChange(current: number, previous: number): { value: number; percentage: number } {
    const change = current - previous;
    const percentage = previous === 0 ? 0 : Math.round((change / previous) * 100);
    return { value: change, percentage };
  }
  
  export function getTimeFrameLabel(days: number): string {
    if (days <= 1) return "today";
    if (days <= 7) return "this week";
    if (days <= 30) return "this month";
    return "total";
  }
  