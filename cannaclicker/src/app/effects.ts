export type FeedbackVariant =
  | 'bud'
  | 'boost'
  | 'seed'
  | 'gold'
  | 'milestone'
  | 'achievement'
  | 'prestige'
  | 'error';

const MAX_FLOATING_PER_ORIGIN = 12;
const MAX_PARTICLES = 42;
let activeParticles = 0;

export function spawnFloatingValue(
  origin: HTMLElement,
  text: string,
  colorOrVariant: string | FeedbackVariant = 'bud',
): void {
  if (getMotionIntensity() === 'minimal') {
    return;
  }

  const variant = resolveVariant(colorOrVariant);
  const color = resolveColor(colorOrVariant, variant);
  const existing = origin.querySelectorAll('.floating-value').length;
  if (existing >= MAX_FLOATING_PER_ORIGIN) {
    updateAggregate(origin, variant);
    return;
  }

  const particle = document.createElement('span');
  particle.textContent = text;
  particle.className = `floating-value floating-value--${variant}`;
  particle.style.left = `${43 + Math.random() * 14}%`;
  particle.style.top = `${42 + Math.random() * 12}%`;
  particle.style.color = color;

  origin.appendChild(particle);

  const horizontalDrift = Math.round((Math.random() - 0.5) * 28);
  const travel = variant === 'error' ? 0 : 48 + Math.round(Math.random() * 18);
  const duration = getMotionIntensity() === 'reduced' ? 620 : 820 + Math.random() * 180;
  const animation = particle.animate(
    [
      { opacity: 0, transform: 'translate(-50%, -35%) scale(0.88)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      {
        opacity: 0,
        transform:
          variant === 'error'
            ? 'translate(-50%, -50%) scale(0.96)'
            : `translate(calc(-50% + ${horizontalDrift}px), calc(-50% - ${travel}px)) scale(0.92)`,
      },
    ],
    {
      duration,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    },
  );

  animation.finished
    .catch(() => void 0)
    .finally(() => {
      particle.remove();
    });
}

export function spawnParticleBurst(
  origin: HTMLElement,
  variant: FeedbackVariant = 'bud',
  requestedCount = 5,
): void {
  const motion = getMotionIntensity();
  if (motion === 'minimal') {
    return;
  }

  const count = Math.min(
    motion === 'reduced' ? 3 : requestedCount,
    MAX_PARTICLES - activeParticles,
  );
  if (count <= 0) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement('span');
    const size = 3 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    const distance = 26 + Math.random() * 38;
    particle.className = `fx-particle fx-particle--${variant}`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${48 + Math.random() * 4}%`;
    particle.style.top = `${48 + Math.random() * 4}%`;
    particle.style.setProperty('--fx-x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--fx-y', `${Math.sin(angle) * distance}px`);
    origin.appendChild(particle);
    activeParticles += 1;

    const animation = particle.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        {
          opacity: 0,
          transform: 'translate(calc(-50% + var(--fx-x)), calc(-50% + var(--fx-y))) scale(0.3)',
        },
      ],
      {
        duration: motion === 'reduced' ? 420 : 650,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      },
    );

    animation.finished
      .catch(() => void 0)
      .finally(() => {
        activeParticles = Math.max(0, activeParticles - 1);
        particle.remove();
      });
  }
}

export function pulseElement(element: HTMLElement, className: string, durationMs = 600): void {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), durationMs);
}

function updateAggregate(origin: HTMLElement, variant: FeedbackVariant): void {
  const aggregate = getOrCreateAggregate(origin, variant);
  const count = Number.parseInt(aggregate.dataset.count ?? '0', 10) + 1;
  aggregate.dataset.count = count.toString();
  aggregate.textContent = `+${count} hits`;

  aggregate.getAnimations().forEach((animation) => animation.cancel());
  const animation = aggregate.animate(
    [
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      { opacity: 0, transform: 'translate(-50%, -4.2rem) scale(0.9)' },
    ],
    {
      duration: 720,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    },
  );
  animation.finished
    .catch(() => void 0)
    .finally(() => {
      aggregate.remove();
    });
}

function getOrCreateAggregate(origin: HTMLElement, variant: FeedbackVariant): HTMLElement {
  const existing = origin.querySelector<HTMLElement>('.floating-value--aggregate');
  if (existing) {
    return existing;
  }

  const aggregate = document.createElement('span');
  aggregate.className = `floating-value floating-value--${variant} floating-value--aggregate`;
  aggregate.dataset.count = '0';
  aggregate.style.left = '50%';
  aggregate.style.top = '42%';
  origin.appendChild(aggregate);
  return aggregate;
}

function resolveVariant(value: string): FeedbackVariant {
  return isVariant(value) ? value : 'bud';
}

function resolveColor(value: string, variant: FeedbackVariant): string {
  if (!isVariant(value)) {
    return value;
  }

  switch (variant) {
    case 'boost':
      return 'rgb(96 165 250)';
    case 'seed':
      return 'rgb(252 211 77)';
    case 'gold':
      return 'rgb(250 204 21)';
    case 'milestone':
      return 'rgb(190 242 100)';
    case 'achievement':
      return 'rgb(125 211 252)';
    case 'prestige':
      return 'rgb(216 180 254)';
    case 'error':
      return 'rgb(251 113 133)';
    default:
      return 'rgb(74 222 128)';
  }
}

function isVariant(value: string): value is FeedbackVariant {
  return ['bud', 'boost', 'seed', 'gold', 'milestone', 'achievement', 'prestige', 'error'].includes(
    value,
  );
}

function getMotionIntensity(): 'full' | 'reduced' | 'minimal' {
  const value = document.body.dataset.motion;
  return value === 'reduced' || value === 'minimal' ? value : 'full';
}
