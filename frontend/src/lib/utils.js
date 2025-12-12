import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// You will need to install clsx and tailwind-merge if you haven't:
// npm install clsx tailwind-merge

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}