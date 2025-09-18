import { animate, spring } from 'motion';

export function spawnFloatingValue(origin: HTMLElement, text: string, color = 'rgb(74 222 128)'): void {
  const particle = document.createElement('span');
  particle.textContent = text;
  particle.className = 'pointer-events-none select-none text-sm font-semibold';
  particle.style.position = 'absolute';
  particle.style.left = '50%';
  particle.style.top = '50%';
  particle.style.transform = 'translate(-50%, -50%)';
  particle.style.color = color;
  particle.style.textShadow = '0 0 12px rgba(74, 222, 128, 0.5)';

  origin.appendChild(particle);

  const animation = animate(
    particle,
    {
      opacity: [1, 0],
      translateY: ['0px', '-48px'],
      scale: [1, 0.9],
    },
    {
      easing: spring({ stiffness: 160, damping: 30 }),
      duration: 1.2,
    },
  );

  animation.finished
    .catch(() => void 0)
    .finally(() => {
      particle.remove();
    });
}