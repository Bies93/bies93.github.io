import type { GameState } from "../state";
import type { LocaleKey } from "../i18n";
import { t } from "../i18n";
import { withBase } from "../paths";
import { formatCompact, formatMultiplier } from "../math";

type InfoKey = "stats.seeds" | "stats.prestigeMult" | "stats.total";

interface TopInfoBarItemRefs {
  container: HTMLDivElement;
  label: HTMLSpanElement;
  value: HTMLSpanElement;
  tooltip: HTMLSpanElement;
}

export interface TopInfoBarRefs {
  root: HTMLDivElement;
  items: Record<InfoKey, TopInfoBarItemRefs>;
}

const INFO_ITEMS: ReadonlyArray<{ key: InfoKey; icon: string }> = [
  { key: "stats.seeds", icon: "icons/ui/ui-save.png" },
  { key: "stats.prestigeMult", icon: "icons/ui/ui-save.png" },
  { key: "stats.total", icon: "icons/ui/icon-leaf-click.png" },
];

export function createTopInfoBar(): TopInfoBarRefs {
  const root = document.createElement("div");
  root.className = "top-info-bar";
  root.setAttribute("role", "list");

  const items = INFO_ITEMS.reduce<Record<InfoKey, TopInfoBarItemRefs>>((acc, item) => {
    const pill = document.createElement("div");
    pill.className = "top-info-pill";
    pill.dataset.variant = item.key;
    pill.setAttribute("role", "listitem");
    pill.tabIndex = 0;

    const iconWrap = document.createElement("span");
    iconWrap.className = "top-info-pill__icon";

    const icon = new Image();
    icon.src = withBase(item.icon);
    icon.alt = "";
    icon.decoding = "async";
    iconWrap.appendChild(icon);

    const textWrap = document.createElement("div");
    textWrap.className = "flex min-w-0 flex-col";

    const label = document.createElement("span");
    label.className = "top-info-pill__label";

    const value = document.createElement("span");
    value.className = "top-info-pill__value tabular-nums";

    textWrap.append(label, value);

    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.setAttribute("role", "tooltip");
    const tooltipId = `top-info-${item.key.replaceAll(".", "-")}-tooltip`;
    tooltip.id = tooltipId;
    pill.setAttribute("aria-describedby", tooltipId);

    pill.append(iconWrap, textWrap, tooltip);
    root.appendChild(pill);

    acc[item.key] = { container: pill, label, value, tooltip };
    return acc;
  }, {} as Record<InfoKey, TopInfoBarItemRefs>);

  return { root, items } satisfies TopInfoBarRefs;
}

export function updateTopInfoBarValues(refs: TopInfoBarRefs, state: GameState): void {
  const locale = state.locale;

  const seeds = refs.items["stats.seeds"];
  const seedsValue = formatCompact(state.prestige.seeds, locale);
  seeds.value.textContent = seedsValue;
  seeds.container.setAttribute("aria-label", `${seeds.container.dataset.label ?? ""}: ${seedsValue}`.trim());

  const prestige = refs.items["stats.prestigeMult"];
  const prestigeValue = formatMultiplier(state.prestige.mult);
  prestige.value.textContent = prestigeValue;
  prestige.container.setAttribute(
    "aria-label",
    `${prestige.container.dataset.label ?? ""}: ${prestigeValue}`.trim(),
  );

  const total = refs.items["stats.total"];
  const totalValue = formatCompact(state.total, locale);
  total.value.textContent = totalValue;
  total.container.setAttribute("aria-label", `${total.container.dataset.label ?? ""}: ${totalValue}`.trim());
}

export function updateTopInfoBarStrings(
  refs: TopInfoBarRefs,
  locale: LocaleKey,
  meta: Record<string, string | undefined>,
): void {
  INFO_ITEMS.forEach(({ key }) => {
    const item = refs.items[key];
    if (!item) {
      return;
    }

    const labelText = t(locale, key);
    item.label.textContent = labelText;
    item.container.dataset.label = labelText;

    const tooltipText = meta[key] ?? "";
    item.tooltip.textContent = tooltipText;
    if (tooltipText) {
      item.tooltip.removeAttribute("aria-hidden");
    } else {
      item.tooltip.setAttribute("aria-hidden", "true");
    }
  });
}
