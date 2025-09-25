import { withBase } from "../paths";

export function mountHeader(root: HTMLElement, controls: HTMLButtonElement[]): HTMLHeadingElement {
  const header = document.createElement("header");
  header.className =
    "grid w-full gap-3 rounded-3xl border border-white/10 bg-neutral-900/80 px-3 py-2 shadow-[0_20px_48px_rgba(10,12,21,0.45)] backdrop-blur-xl sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-14 sm:gap-y-2 sm:px-6 lg:px-8";

  const logoWrap = document.createElement("div");
  logoWrap.className =
    "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lime-300/35 via-emerald-300/25 to-emerald-500/30 shadow-[0_0_20px_rgba(202,255,120,0.45)] ring-1 ring-lime-200/35 sm:h-14 sm:w-14";

  const leaf = new Image();
  leaf.src = withBase("img/logo-leaf.svg");
  leaf.alt = "";
  leaf.decoding = "async";
  leaf.className =
    "h-8 w-8 drop-shadow-[0_12px_24px_rgba(202,255,150,0.55)] saturate-150 brightness-110 sm:h-10 sm:w-10";

  logoWrap.appendChild(leaf);

  const headerTitle = document.createElement("h1");
  headerTitle.className = "app-header__title";
  headerTitle.textContent = "CannaBies";

  const actionWrap = document.createElement("div");
  actionWrap.className =
    "flex flex-nowrap items-center justify-self-stretch gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-1 shadow-[0_16px_30px_rgba(10,12,21,0.4)] ring-1 ring-white/10 backdrop-blur sm:justify-self-end";
  controls.forEach((control) => {
    control.classList.add("shrink-0");
    actionWrap.append(control);
  });

  header.append(logoWrap, headerTitle, actionWrap);
  root.prepend(header);
  return headerTitle;
}
