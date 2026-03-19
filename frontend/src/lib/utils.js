import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return "TBA";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

export function getFullCountryName(countryCode) {
  if (!countryCode) return "N/A";
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(countryCode.toUpperCase());
  } catch (e) {
    return countryCode;
  }
}

export function getFullLanguageName(languageCode) {
  if (!languageCode) return "N/A";
  try {
    const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
    return languageNames.of(languageCode.toLowerCase());
  } catch (e) {
    return languageCode;
  }
}

export function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
