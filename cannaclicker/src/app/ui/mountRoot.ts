import { withBase } from "../paths";

export interface MountRootResult {
  root: HTMLElement;
  layout: HTMLDivElement;
  primaryColumn: HTMLDivElement;
  secondaryColumn: HTMLDivElement;
  hudNotice: HTMLDivElement;
  issues: { missingRoot: boolean };
}

function ensureRoot(): { element: HTMLElement; missing: boolean } {
  const existingRoot = document.getElementById("app");
  if (existingRoot) {
    return { element: existingRoot, missing: false };
  }

  const fallbackRoot = document.createElement("div");
  fallbackRoot.id = "app";
  fallbackRoot.className = "min-h-screen bg-neutral-950 text-neutral-100";
  document.body.appendChild(fallbackRoot);
  return { element: fallbackRoot, missing: true };
}

export function mountRoot(): MountRootResult {
  const { element: root, missing } = ensureRoot();

  root.innerHTML = "";
  root.className =
    "relative mx-auto flex w-full max-w-[92rem] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-10";
  root.dataset.uiRole = "app-root";
  root.dataset.testid = "app-root";
  root.dataset.uiState = missing ? "fallback" : "ready";

  const heroImageSet = `image-set(url("${withBase('img/bg-hero-1920.png')}") type("image/png") 1x, url("${withBase('img/bg-hero-2560.png')}") type("image/png") 2x)`;
  document.documentElement.style.setProperty("--hero-image", heroImageSet);
  document.documentElement.style.setProperty("--bg-plants", `url("${withBase('img/bg-plants-1280.png')}")`);
  document.documentElement.style.setProperty("--bg-noise", `url("${withBase('img/bg-noise-512.png')}")`);

  const hudNotice = document.createElement("div");
  hudNotice.className =
    "pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6";
  hudNotice.dataset.uiRole = "hud-notice";
  hudNotice.dataset.testid = "hud-notice";
  hudNotice.setAttribute("aria-live", "polite");
  hudNotice.setAttribute("role", "status");
  root.appendChild(hudNotice);

  const layout = document.createElement("div");
  layout.className =
    "grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-6 2xl:gap-8";
  layout.dataset.uiRole = "app-layout";
  layout.dataset.testid = "app-layout";

  const primaryColumn = document.createElement("div");
  primaryColumn.className = "space-y-4";
  primaryColumn.dataset.uiRole = "primary-column";
  primaryColumn.dataset.testid = "primary-column";

  const secondaryColumn = document.createElement("div");
  secondaryColumn.className = "space-y-4";
  secondaryColumn.dataset.uiRole = "secondary-column";
  secondaryColumn.dataset.testid = "secondary-column";

  layout.append(primaryColumn, secondaryColumn);
  root.appendChild(layout);

  return {
    root,
    layout,
    primaryColumn,
    secondaryColumn,
    hudNotice,
    issues: { missingRoot: missing },
  };
}
