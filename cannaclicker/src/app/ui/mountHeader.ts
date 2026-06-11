import { uiIcons } from '../assetManifest';

export function mountHeader(root: HTMLElement, controls: HTMLButtonElement[]): HTMLHeadingElement {
  const header = document.createElement('header');
  header.className = 'app-header surface--utility';
  header.dataset.uiRole = 'app-header';
  header.dataset.testid = 'app-header';
  header.setAttribute('role', 'banner');

  const brand = document.createElement('div');
  brand.className = 'app-brand';
  brand.dataset.uiRole = 'app-brand';

  const logoWrap = document.createElement('div');
  logoWrap.className = 'app-brand__mark';
  logoWrap.dataset.uiRole = 'app-logo';
  logoWrap.dataset.testid = 'app-logo';

  const monogram = document.createElement('span');
  monogram.className = 'app-brand__monogram';
  monogram.textContent = 'B';
  monogram.setAttribute('aria-hidden', 'true');

  const slash = document.createElement('span');
  slash.className = 'app-brand__slash';
  slash.setAttribute('aria-hidden', 'true');

  const leaf = new Image();
  leaf.src = uiIcons.leaf;
  leaf.alt = '';
  leaf.decoding = 'async';
  leaf.className = 'app-brand__leaf';

  logoWrap.append(monogram, leaf, slash);

  const brandCopy = document.createElement('div');
  brandCopy.className = 'app-brand__copy';

  const headerTitle = document.createElement('h1');
  headerTitle.className = 'app-header__title';
  headerTitle.textContent = 'CannaBies';
  headerTitle.dataset.text = 'CannaBies';

  const tagline = document.createElement('span');
  tagline.className = 'app-header__tagline';
  tagline.textContent = 'Bloom mode';

  const actionWrap = document.createElement('div');
  actionWrap.className =
    'surface--utility flex flex-nowrap items-center justify-self-stretch gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-1 shadow-[0_16px_30px_rgba(10,12,21,0.4)] ring-1 ring-white/10 backdrop-blur sm:justify-self-end';
  actionWrap.dataset.uiRole = 'control-strip';
  actionWrap.dataset.testid = 'control-strip';
  controls.forEach((control) => {
    control.classList.add('shrink-0');
    actionWrap.append(control);
  });

  brandCopy.append(headerTitle, tagline);
  brand.append(logoWrap, brandCopy);
  header.append(brand, actionWrap);
  root.prepend(header);
  return headerTitle;
}
