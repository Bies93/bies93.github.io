import type { GameState } from '../../../state';
import { t, type LocaleKey } from '../../../i18n';
import type { MilestoneProgressDetail } from '../../../milestones';
import type { PrestigePreview } from '../../../prestige';
import { formatInteger, formatPercent } from './number';
import { formatDuration } from './time';

function formatMultiplier(locale: LocaleKey, value: number): string {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(Math.max(0, value));
}

export function formatPermanentBonusSummary(locale: LocaleKey, preview: PrestigePreview): string {
  const permanent = [
    { id: 'global' as const, value: preview.permanentGlobalPercent },
    { id: 'bps' as const, value: preview.permanentBpsPercent },
    { id: 'bpc' as const, value: preview.permanentBpcPercent },
  ].filter((entry) => entry.value > 0);

  if (!permanent.length) {
    return t(locale, 'prestige.summary.none');
  }

  return permanent
    .map((entry) =>
      t(locale, `prestige.summary.${entry.id}`, {
        value: formatPercent(locale, entry.value),
      }),
    )
    .join(', ');
}

export function formatNextKickstartSummary(locale: LocaleKey, preview: PrestigePreview): string {
  const config = preview.nextKickstartConfig;
  if (!config) {
    return t(locale, 'prestige.kickstart.none');
  }

  const discountPercent = (1 - config.costMult) * 100;
  const cost =
    discountPercent > 0
      ? t(locale, 'prestige.kickstart.discount', {
          value: formatPercent(locale, discountPercent),
        })
      : '';

  return t(locale, 'prestige.kickstart.summary', {
    level: config.level,
    mult: formatMultiplier(locale, config.bpsMult),
    duration: formatDuration(config.durationMs),
    cost,
  });
}

export function formatActiveKickstartSummary(locale: LocaleKey, preview: PrestigePreview): string {
  if (preview.activeKickstartLevel <= 0 || preview.activeKickstartRemainingMs <= 0) {
    return t(locale, 'prestige.kickstart.inactive');
  }

  const discountPercent = (1 - preview.activeKickstartCostMult) * 100;
  const cost =
    discountPercent > 0
      ? t(locale, 'prestige.kickstart.discount', {
          value: formatPercent(locale, discountPercent),
        })
      : '';

  return t(locale, 'prestige.kickstart.activeSummary', {
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
    case 'unique_buildings':
      return t(locale, 'milestones.progress.unique', {
        current: formatInteger(locale, detail.owned),
        target: formatInteger(locale, detail.target),
      });
    case 'buildings_at_least':
      return t(locale, 'milestones.progress.atLeast', {
        amount: formatInteger(locale, detail.amount),
        current: formatInteger(locale, detail.satisfied),
        target: formatInteger(locale, detail.target),
      });
    case 'any_building_at_least':
      return t(locale, 'milestones.progress.any', {
        current: formatInteger(locale, detail.best),
        target: formatInteger(locale, detail.target),
      });
    case 'unlocked_and_any_at_least':
      return t(locale, 'milestones.progress.unlocked', {
        unlocked: formatInteger(locale, detail.unlocked),
        total: formatInteger(locale, detail.total),
        current: formatInteger(locale, detail.best),
        target: formatInteger(locale, detail.target),
      });
    default:
      return '';
  }
}
