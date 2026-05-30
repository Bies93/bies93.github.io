const isDevelopment = import.meta.env.DEV;

export const flags = {
  prestige: false,
  analytics: false,
  devtools: isDevelopment,
} as const;
