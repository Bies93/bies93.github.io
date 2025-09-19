export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const normalized = path.replace(/^\.?\/+/, "");
  return `${base}${normalized}`;
};
