import type { GameState } from "../state";
import type { LocaleKey } from "../i18n";
import { t } from "../i18n";
import { withBase } from "../paths";
import { formatCompact, toDecimal } from "../math";

type HudKey = "stats.buds" | "stats.bps" | "stats.bpc";

interface BudHUDItemRefs {
  container: HTMLDivElement;
  label: HTMLSpanElement;
  value: HTMLSpanElement;
  tooltip: HTMLSpanElement;
}

export interface BudHUDRefs {
  root: HTMLDivElement;
  items: Record<HudKey, BudHUDItemRefs>;
}

const HUD_ITEMS: ReadonlyArray<{ key: HudKey; icon: string; modifier: string }> = [
  { key: "stats.buds", icon: "icons/ui/icon-leaf-click.png", modifier: "buds" },
  { key: "stats.bps", icon: "icons/upgrades/upgrade-global-bps.png", modifier: "bps" },
  { key: "stats.bpc", icon: "icons/ui/icon-leaf-click.png", modifier: "bpc" },
];

const LOCALE_MAP: Record<LocaleKey, string> = { de: "de-DE", en: "en-US" } as const;

export function createBudHUD(): BudHUDRefs {
  const root = document.createElement("div");
  root.className = "bud-hud";

  const items = HUD_ITEMS.reduce<Record<HudKey, BudHUDItemRefs>>((acc, item) => {
    const chip = document.createElement("div");
    chip.className = `bud-hud__chip bud-hud__chip--${item.modifier}`;
    chip.dataset.variant = item.key;
    chip.tabIndex = 0;

    const icon = new Image();
    icon.src = withBase(item.icon);
    icon.alt = "";
    icon.decoding = "async";
    icon.className = "bud-hud__icon";

    const content = document.createElement("div");
    content.className = "flex min-w-0 flex-col";

    const label = document.createElement("span");
    label.className = "bud-hud__label";

    const value = document.createElement("span");
    value.className = "bud-hud__value tabular-nums";

    content.append(label, value);

    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.setAttribute("role", "tooltip");
    if (item.key === "stats.buds") {
      tooltip.dataset.placement = "bottom";
    }
    const tooltipId = `bud-hud-${item.key.replaceAll(".", "-")}-tooltip`;
    tooltip.id = tooltipId;
    chip.setAttribute("aria-describedby", tooltipId);

    chip.append(icon, content, tooltip);
    root.appendChild(chip);

    acc[item.key] = { container: chip, label, value, tooltip };
    return acc;
  }, {} as Record<HudKey, BudHUDItemRefs>);

  return { root, items } satisfies BudHUDRefs;
}

export function updateBudHUDValues(refs: BudHUDRefs, state: GameState): void {
  const locale = state.locale;

  const buds = refs.items["stats.buds"];
  const budsValue = formatCompact(state.buds, locale);
  buds.value.textContent = budsValue;
  buds.container.setAttribute("aria-label", `${buds.container.dataset.label ?? ""}: ${budsValue}`.trim());

  const bps = refs.items["stats.bps"];
  const bpsValue = formatRate(state.bps, locale);
  bps.value.textContent = bpsValue;
  bps.container.setAttribute("aria-label", `${bps.container.dataset.label ?? ""}: ${bpsValue}`.trim());

  const bpc = refs.items["stats.bpc"];
  const bpcValue = formatRate(state.bpc, locale);
  bpc.value.textContent = bpcValue;
  bpc.container.setAttribute("aria-label", `${bpc.container.dataset.label ?? ""}: ${bpcValue}`.trim());
}

export function updateBudHUDStrings(
  refs: BudHUDRefs,
  locale: LocaleKey,
  meta: Record<string, string | undefined>,
): void {
  HUD_ITEMS.forEach(({ key }) => {
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

function formatRate(value: unknown, locale: LocaleKey): string {
  const decimal = toDecimal(value);
  if (!Number.isFinite(decimal.mantissa) || !Number.isFinite(decimal.exponent)) {
    return "0";
  }

  const absolute = decimal.abs();
  if (absolute.greaterThanOrEqualTo(1000)) {
    return formatCompact(decimal, locale);
  }

  const localized = Number(decimal.toFixed(1));
  return Number.isFinite(localized)
    ? localized.toLocaleString(LOCALE_MAP[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : "0";
}
