const stripLeading = (path: string): string => path.replace(/^\.?\/+/, "");

const ensureDirectoryHref = (raw: string): string => {
  const url = new URL(raw);
  url.search = "";
  url.hash = "";

  if (/\.[^/]+$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/[^/]*$/, "");
  } else if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url.href;
};

const resolveBaseUrl = (): string | null => {
  if (typeof document !== "undefined" && document.baseURI) {
    return ensureDirectoryHref(document.baseURI);
  }

  if (typeof window !== "undefined" && window.location?.href) {
    return ensureDirectoryHref(window.location.href);
  }

  return null;
};

export const withBase = (path: string): string => {
  const normalized = stripLeading(path);
  const runtimeBase = resolveBaseUrl();

  if (runtimeBase) {
    const baseUrl = new URL(import.meta.env.BASE_URL, runtimeBase);
    return new URL(normalized, baseUrl).pathname;
  }

  const fallback = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${fallback}${normalized}`;
};
