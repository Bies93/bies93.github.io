import type { GameState } from "../../../state";
import { t, type LocaleKey } from "../../../i18n";
import type { MilestoneProgressDetail } from "../../../milestones";
import type { PrestigePreview } from "../../../prestige";
import { formatDecimal } from "../../../math";
import { formatInteger, formatPercent } from "./number";

export function formatPermanentBonusSummary(
  locale: LocaleKey,
  preview: PrestigePreview,
): string {
  const permanent = preview.permanentBonus;
  return permanent.length
    ? permanent
        .map((entry) =>
          t(locale, `prestige.permanent.${entry.id}`, {
            value: entry.value,
          }),
        )
        .join(", ")
    : t(locale, "prestige.permanent.empty");
}

export function formatNextKickstartSummary(
  locale: LocaleKey,
  preview: PrestigePreview,
): string {
  if (!preview.kickstartNext) {
    return t(locale, "prestige.kickstartNext.empty");
  }

  return preview.kickstartNext
    .map((entry) =>
      t(locale, `prestige.kickstart.${entry.id}`, {
        value: entry.value,
      }),
    )
    .join(", ");
}

export function formatActiveKickstartSummary(
  locale: LocaleKey,
  preview: PrestigePreview,
): string {
  if (!preview.activeKickstart) {
    return t(locale, "prestige.kickstartActive.empty");
  }

  return preview.activeKickstart
    .map((entry) =>
      t(locale, `prestige.kickstart.${entry.id}`, {
        value: entry.value,
      }),
    )
    .join(", ");
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
