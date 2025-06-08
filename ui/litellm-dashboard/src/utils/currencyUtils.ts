let runtimeConfig = {
  locale: "en-US", // fallback, default values
  currency: "USD",
};

export const loadRuntimeCurrencySettings = async () => {
  try {
    const res = await fetch("/get/currencySettings");
    if (res.ok) {
      const data = await res.json();
      runtimeConfig = {
        currency: data.currency || "USD",
        locale: data.locale || "en-US",
      };
    }
  } catch (error) {
    console.warn("Failed to load currency settings from backend:", error);
  }
};

// Load currency settings at app startup
loadRuntimeCurrencySettings();

export const formatCurrency = (
  amount: number | string | null,
  locale: string = runtimeConfig.locale,
  currency: string = runtimeConfig.currency
): string => {
  if (amount === undefined || amount === null) return "";
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numeric);
};

export const getCurrencySymbol = (
  locale: string = runtimeConfig.locale,
  currency: string = runtimeConfig.currency
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

export const getCurrencyCode = (): string => {
  return runtimeConfig.currency;
};
