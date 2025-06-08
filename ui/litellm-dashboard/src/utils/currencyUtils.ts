// Load environment defaults
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en-US";
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "USD";

/**
 * Format a number (or numeric string) into a localized currency string.
 * Example: formatCurrency(1234.56) → "$1,234.56"
 */
export const formatCurrency = (
  amount: number | string | null,
  locale: string = DEFAULT_LOCALE,
  currency: string = DEFAULT_CURRENCY
): string => {
  if (amount === undefined || amount === null) return "";

  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numeric)) return "";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numeric);
};

/**
 * Get the currency symbol for a given locale and currency.
 * Example: getCurrencySymbol() → "$"
 */
export const getCurrencySymbol = (
  locale: string = DEFAULT_LOCALE,
  currency: string = DEFAULT_CURRENCY
): string => {
  return (0)
    .toLocaleString(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, "")
    .trim();
};

/**
 * Get the currency code configured via ENV.
 * Example: getCurrencyCode() → "USD"
 */
export const getCurrencyCode = (): string => {
  return DEFAULT_CURRENCY;
};
