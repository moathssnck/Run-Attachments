import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const easternToWesternMap: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

export function toWesternNumerals(str: string): string {
  return str.replace(/[٠-٩]/g, (char) => easternToWesternMap[char] || char);
}

export function formatNumberWestern(num: number, options?: Intl.NumberFormatOptions): string {
  return num.toLocaleString('en-US', options);
}
