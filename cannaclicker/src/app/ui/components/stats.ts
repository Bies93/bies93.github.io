import { t } from "../../i18n";
import { withBase } from "../../paths";

function getStatIcon(key: string): string {
  const iconMap: Record<string, string> = {
    "stats.buds": "icons/ui/icon-leaf-click.png",
    "stats.bps": "icons/upgrades/upgrade-global-bps.png",
    "stats.bpc": "icons/ui/ui-stat-bpc.png",
    "stats.total": "icons/ui/ui-stat-total.png",
    "stats.seeds": "icons/ui/ui-seed.png",
    "stats.seedRate": "icons/ui/ui-seed.png",
    "stats.prestigeMult": "icons/ui/ui-prestige-mult.png",
  };
  return iconMap[key] || "icons/ui/icon-leaf-click.png";
}

export function createCompactStatBlock(
  key: string,
  container: HTMLElement,
  labels: Map<string, HTMLElement>,
  meta: Map<string, HTMLElement>,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "stat-item";
  wrapper.dataset.variant = key;

  const iconWrap = document.createElement("span");
  iconWrap.className = "stat-item__icon-wrap";

  const icon = document.createElement("img");
  icon.className = "stat-item__icon";
  icon.src = withBase(getStatIcon(key));
  icon.alt = "";
  icon.loading = "lazy";

  iconWrap.append(icon);

  const contentDiv = document.createElement("div");
  contentDiv.className = "stat-item__content";

  const label = document.createElement("div");
  label.className = "stat-item__label";
  label.textContent = t("en", key);

  const value = document.createElement("div");
  value.className = "stat-item__value";
  value.textContent = "0";

  const metaLine = document.createElement("div");
  metaLine.className = "stat-item__meta";
  metaLine.textContent = "";

  contentDiv.append(label, value, metaLine);
  wrapper.append(iconWrap, contentDiv);
  container.appendChild(wrapper);

  labels.set(key, label);
  meta.set(key, metaLine);

  return value;
}

export function createStatBlock(
  key: string,
  container: HTMLElement,
  labels: Map<string, HTMLElement>,
  meta: Map<string, HTMLElement>,
): HTMLElement {
  return createCompactStatBlock(key, container, labels, meta);
}

export function createDetail(
  wrapper: HTMLElement,
  labelText: string,
): { label: HTMLElement; value: HTMLElement } {
  const label = document.createElement("dt");
  label.textContent = labelText;
  label.className = "text-neutral-400";
  const value = document.createElement("dd");
  value.className = "justify-self-end font-medium text-neutral-100";
  wrapper.append(label, value);
  return { label, value };
}
