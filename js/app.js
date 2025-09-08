// Theme toggle with localStorage and prefers-color-scheme
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.classList.add('dark');
      document.getElementById('sun')?.classList.remove('hidden');
      document.getElementById('moon')?.classList.add('hidden');
    } else {
      root.classList.remove('dark');
      document.getElementById('sun')?.classList.add('hidden');
      document.getElementById('moon')?.classList.remove('hidden');
    }
  }

  applyTheme(saved ?? (prefersDark ? 'dark' : 'light'));

  btn?.addEventListener('click', () => {
    const isDark = root.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme(isDark ? 'dark' : 'light');
  });
})();

// Mobile navigation toggle
(function () {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!open));
  });
})();

// Contact form progressive enhancement
(function () {
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('formMsg');
  if (!form || !msg) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !email || !subject || !message) {
      msg.textContent = 'Bitte alle Felder ausfüllen.';
      msg.classList.remove('text-green-400');
      msg.classList.add('text-red-400');
      return;
    }
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail) {
      msg.textContent = 'Bitte eine gültige E‑Mail eingeben.';
      msg.classList.remove('text-green-400');
      msg.classList.add('text-red-400');
      return;
    }
    msg.textContent = 'Sende …';
    msg.classList.remove('text-red-400');
    msg.classList.add('text-ink-300');
    setTimeout(() => {
      msg.textContent = 'Nachricht erfolgreich gesendet. Danke!';
      msg.classList.remove('text-ink-300');
      msg.classList.add('text-green-400');
      form.reset();
    }, 900);
  });
})();

// Small utility: current year
document.getElementById('year')?.append(new Date().getFullYear());

