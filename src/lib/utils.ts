import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SCHOOL_DATA } from "@/lib/school-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = SCHOOL_DATA.currencyCode,
  locale: string = SCHOOL_DATA.locale
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, locale: string = SCHOOL_DATA.locale): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(dateString: string, locale: string = SCHOOL_DATA.locale): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string, locale: string = SCHOOL_DATA.locale): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}
