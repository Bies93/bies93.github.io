export function spawnFloatingValue(
  origin: HTMLElement,
  text: string,
  color = 'rgb(74 222 128)',
): void {
  const particle = document.createElement('span');
  particle.textContent = text;
  particle.className = 'pointer-events-none select-none text-sm font-semibold';
  particle.style.position = 'absolute';
  particle.style.left = `${46 + Math.random() * 8}%`;
  particle.style.top = `${44 + Math.random() * 8}%`;
  particle.style.transform = 'translate(-50%, -50%)';
  particle.style.color = color;
  particle.style.textShadow = '0 0 12px rgba(74, 222, 128, 0.5)';

  origin.appendChild(particle);

  const animation = particle.animate(
    [
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      { opacity: 0, transform: 'translate(-50%, calc(-50% - 3rem)) scale(0.9)' },
    ],
    {
      duration: 900,
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
