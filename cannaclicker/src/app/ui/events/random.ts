import { asset } from "../../assets";
import { createItemSrcset } from "../components/media";
import { t } from "../../i18n";
import type { EventId } from "../../events";
import type { GameState } from "../../state";
import type { UIRefs } from "../types";

export interface EventPresentation {
  id: EventId;
  icon: string;
  labelKey: string;
}

export const EVENT_PRESENTATIONS: readonly EventPresentation[] = [
  { id: "golden_bud", icon: "icons/events/golden_bud.png", labelKey: "events.goldenBud.name" },
  { id: "seed_pack", icon: "icons/events/seed_pack.png", labelKey: "events.seedPack.name" },
  { id: "lucky_joint", icon: "icons/events/lucky_joint.png", labelKey: "events.luckyJoint.name" },
];

export function getEventPresentation(id: EventId): EventPresentation {
  return EVENT_PRESENTATIONS.find((entry) => entry.id === id) ?? EVENT_PRESENTATIONS[0];
}

export function createEventButton(
  definition: EventPresentation,
  state: GameState,
  lifetime: number,
  refs: UIRefs,
): HTMLButtonElement | null {
  const layer = refs.eventLayer ?? refs.eventRoot ?? null;
  if (!layer) {
    return null;
  }
  const rect = layer.getBoundingClientRect();
  const path = computeEventPath(rect, lifetime);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "event-icon";
  button.dataset.uiRole = "random-event";
  button.dataset.testid = "random-event";
  button.style.left = `${path.startX}px`;
  button.style.top = `${path.startY}px`;
  button.style.transform = "translate(-50%, -50%)";
  button.setAttribute("aria-label", t(state.locale, definition.labelKey));

  const iconPath = asset(definition.icon);
  const image = new Image();
  image.src = iconPath;
  image.srcset = createItemSrcset(iconPath);
  image.alt = "";
  image.decoding = "async";
  image.draggable = false;
  image.className = "event-icon__img";

  button.appendChild(image);

  button.animate(
    [
      { transform: "translate(-50%, -50%)" },
      {
        transform: `translate(calc(-50% + ${path.dx}px), calc(-50% + ${path.dy}px))`,
      },
    ],
    {
      duration: lifetime,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    },
  );

  return button;
}

export function computeEventPath(rect: DOMRect, lifetime: number): {
  startX: number;
  startY: number;
  dx: number;
  dy: number;
} {
  const width = rect.width;
  const height = rect.height;
  const horizontalMargin = Math.min(width * 0.1, 120);
  const verticalMargin = Math.min(height * 0.15, 140);
  const baseRatio = randomBetween(0.5, 0.7);
  const travelDistance = (width * baseRatio * lifetime) / 10_000;
  const direction = Math.random() < 0.5 ? -1 : 1;

  let startX = randomBetween(horizontalMargin, width - horizontalMargin);
  let endX = startX + direction * travelDistance;
  const minX = horizontalMargin;
  const maxX = width - horizontalMargin;
  if (endX < minX) {
    const correction = minX - endX;
    startX += correction;
    endX = minX;
  } else if (endX > maxX) {
    const correction = endX - maxX;
    startX -= correction;
    endX = maxX;
  }

  const startY = randomBetween(verticalMargin, height - verticalMargin);
  const drift = Math.min(height * 0.12, 120);
  let endY = startY + randomBetween(-drift, drift);
  const minY = verticalMargin;
  const maxY = height - verticalMargin;
  if (endY < minY) {
    endY = minY;
  } else if (endY > maxY) {
    endY = maxY;
  }

  return {
    startX,
    startY,
    dx: endX - startX,
    dy: endY - startY,
  };
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
