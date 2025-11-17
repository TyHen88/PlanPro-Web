import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency }).format(amount)
}

// export const formatDate = (date: Date) => {
//   return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
// }