/**
 * cn — className concatenation helper, mirrors the
 * `tailwind-merge + clsx` pattern used in shadcn/kibo-ui.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
