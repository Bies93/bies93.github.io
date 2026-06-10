const stripLeading = (path: string): string => path.replace(/^\.?\/+/, '');

const ensureDirectoryHref = (raw: string): string => {
  const url = new URL(raw);
  url.search = '';
  url.hash = '';

  if (/\.[^/]+$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/[^/]*$/, '');
  } else if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }

  return url.href;
};

const resolveBaseUrl = (): string | null => {
  if (typeof document !== 'undefined' && document.baseURI) {
    return ensureDirectoryHref(document.baseURI);
  }

  if (typeof window !== 'undefined' && window.location?.href) {
    return ensureDirectoryHref(window.location.href);
  }

  return null;
};

const getConfiguredBaseUrl = (): string => {
  const meta = import.meta as ImportMeta & { env?: { BASE_URL?: string } };
  return meta.env?.BASE_URL ?? '/';
};

export const withBase = (path: string): string => {
  const normalized = stripLeading(path);
  const runtimeBase = resolveBaseUrl();

  if (runtimeBase) {
    const baseUrl = new URL(getConfiguredBaseUrl(), runtimeBase);
    return new URL(normalized, baseUrl).pathname;
  }

  const fallback = getConfiguredBaseUrl().replace(/\/?$/, '/');
  return `${fallback}${normalized}`;
};
