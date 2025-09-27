import type { GameState } from "../../../state";
import { t, type LocaleKey } from "../../../i18n";
import type { MilestoneProgressDetail } from "../../../milestones";
import type { PrestigePreview } from "../../../prestige";
import { formatDecimal } from "../../../math";
import { formatInteger, formatPercent } from "./number";
import { formatDuration } from "./time";

function formatMultiplier(locale: LocaleKey, value: number): string {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(Math.max(0, value));
}

export function formatPermanentBonusSummary(
  locale: LocaleKey,
  preview: PrestigePreview,
): string {
  const permanent = [
    { id: "global" as const, value: preview.permanentGlobalPercent },
    { id: "bps" as const, value: preview.permanentBpsPercent },
    { id: "bpc" as const, value: preview.permanentBpcPercent },
  ].filter((entry) => entry.value > 0);

  if (!permanent.length) {
    return t(locale, "prestige.summary.none");
  }

  return permanent
    .map((entry) =>
      t(locale, `prestige.summary.${entry.id}`, {
        value: formatPercent(locale, entry.value),
      }),
    )
    .join(", ");
}

export function formatNextKickstartSummary(
  locale: LocaleKey,
  preview: PrestigePreview,
): string {
  const config = preview.nextKickstartConfig;
  if (!config) {
    return t(locale, "prestige.kickstart.none");
  }

  const discountPercent = (1 - config.costMult) * 100;
  const cost =
    discountPercent > 0
      ? t(locale, "prestige.kickstart.discount", {
          value: formatPercent(locale, discountPercent),
        })
      : "";

  return t(locale, "prestige.kickstart.summary", {
    level: config.level,
    mult: formatMultiplier(locale, config.bpsMult),
    duration: formatDuration(config.durationMs),
    cost,
  });
}

export function formatActiveKickstartSummary(
  locale: LocaleKey,
  preview: PrestigePreview,
): string {
  if (preview.activeKickstartLevel <= 0 || preview.activeKickstartRemainingMs <= 0) {
    return t(locale, "prestige.kickstart.inactive");
  }

  const discountPercent = (1 - preview.activeKickstartCostMult) * 100;
  const cost =
    discountPercent > 0
      ? t(locale, "prestige.kickstart.discount", {
          value: formatPercent(locale, discountPercent),
        })
      : "";

  return t(locale, "prestige.kickstart.activeSummary", {
    level: preview.activeKickstartLevel,
    mult: formatMultiplier(locale, preview.activeKickstartBpsMult),
    remaining: formatDuration(preview.activeKickstartRemainingMs),
    cost,
  });
}

export function formatMilestoneProgressText(
  state: GameState,
  detail: MilestoneProgressDetail,
): string {
  const { locale } = state;
  switch (detail.type) {
    case "buds":
      return t(locale, "milestones.progress.buds", {
        current: formatDecimal(detail.current),
        target: formatDecimal(detail.target),
      });
    case "buds_per_second":
      return t(locale, "milestones.progress.bps", {
        current: formatDecimal(detail.current),
        target: formatDecimal(detail.target),
      });
    case "buds_per_click":
      return t(locale, "milestones.progress.bpc", {
        current: formatDecimal(detail.current),
        target: formatDecimal(detail.target),
      });
    case "total_buds":
      return t(locale, "milestones.progress.total", {
        current: formatDecimal(detail.current),
        target: formatDecimal(detail.target),
      });
    case "owned_upgrades":
      return t(locale, "milestones.progress.upgrades", {
        current: formatInteger(locale, detail.current),
        target: formatInteger(locale, detail.target),
      });
    case "unlocked_research":
      return t(locale, "milestones.progress.research", {
        current: formatInteger(locale, detail.current),
        target: formatInteger(locale, detail.target),
      });
    case "total_research":
      return t(locale, "milestones.progress.totalResearch", {
        current: formatInteger(locale, detail.current),
        target: formatInteger(locale, detail.target),
      });
    case "prestige_resets":
      return t(locale, "milestones.progress.resets", {
        current: formatInteger(locale, detail.current),
        target: formatInteger(locale, detail.target),
      });
    case "research_effect":
      return t(locale, "milestones.progress.researchEffect", {
        current: formatPercent(locale, detail.current),
        target: formatPercent(locale, detail.target),
      });
    case "purchase_any":
      return t(locale, "milestones.progress.purchaseAny", {
        current: formatInteger(locale, detail.current),
        target: formatInteger(locale, detail.target),
      });
    case "unlock_any":
      return t(locale, "milestones.progress.unlockAny", {
        current: formatInteger(locale, detail.current),
        target: formatInteger(locale, detail.target),
      });
    case "unlocked_and_any_at_least":
      return t(locale, "milestones.progress.unlocked", {
        unlocked: formatInteger(locale, detail.unlocked),
        total: formatInteger(locale, detail.total),
        current: formatInteger(locale, detail.best),
        target: formatInteger(locale, detail.target),
      });
    default:
      return "";
  }
}
