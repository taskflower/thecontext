// src/plugins/create-workspace/utils.ts

/**
 * Extracts domain name from a URL string
 * @param url The URL to extract domain from
 * @returns The domain name without protocol and www
 */
export function extractDomainFromUrl(url: string): string {
  try {
    // Handle URLs without protocol
    if (!url.includes("://")) {
      url = "http://" + url;
    }

    const urlObj = new URL(url);
    let domain = urlObj.hostname;

    // Remove www. prefix if present
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }

    return domain;
  } catch {
    // If URL parsing fails, return original input or empty string
    return url || "";
  }
}

/**
 * Generates a safe slug from a string
 * @param str The string to convert to slug
 * @returns Slug-friendly string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Creates a readable name from a URL
 * @param url The URL to convert
 * @returns A readable name based on URL domain
 */
export function getNameFromUrl(url: string): string {
  const domain = extractDomainFromUrl(url);

  // Split by dots and take first part
  const parts = domain.split(".");
  const name = parts[0];

  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Validates if a string is a valid URL
 * @param url The URL to validate
 * @returns Boolean indicating if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    // Handle URLs without protocol
    if (!url.includes("://")) {
      url = "http://" + url;
    }

    new URL(url);
    return true;
  } catch {
    return false;
  }
}
