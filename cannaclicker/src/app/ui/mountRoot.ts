import { withBase } from "../paths";

export interface MountRootResult {
  root: HTMLElement;
  layout: HTMLDivElement;
  primaryColumn: HTMLDivElement;
  secondaryColumn: HTMLDivElement;
}

export function mountRoot(): MountRootResult {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("#app root missing");
  }

  root.innerHTML = "";
  root.className =
    "relative mx-auto flex w-full max-w-[92rem] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-10";

  const heroImageSet = `image-set(url("${withBase('img/bg-hero-1920.png')}") type("image/png") 1x, url("${withBase('img/bg-hero-2560.png')}") type("image/png") 2x)`;
  document.documentElement.style.setProperty("--hero-image", heroImageSet);
  document.documentElement.style.setProperty("--bg-plants", `url("${withBase('img/bg-plants-1280.png')}")`);
  document.documentElement.style.setProperty("--bg-noise", `url("${withBase('img/bg-noise-512.png')}")`);

  const layout = document.createElement("div");
  layout.className =
    "grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-6 2xl:gap-8";

  const primaryColumn = document.createElement("div");
  primaryColumn.className = "space-y-4";

  const secondaryColumn = document.createElement("div");
  secondaryColumn.className = "space-y-4";

  layout.append(primaryColumn, secondaryColumn);

  return { root, layout, primaryColumn, secondaryColumn };
}
