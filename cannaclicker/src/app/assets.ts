import { withBase } from './paths';
import { APP_VERSION } from './version';

const ASSET_VERSION = encodeURIComponent(APP_VERSION);

export function asset(path: string): string {
  const resolved = withBase(path);
  if (!path.replace(/^\.?\/+/, '').startsWith('img/')) {
    return resolved;
  }

  return `${resolved}${resolved.includes('?') ? '&' : '?'}v=${ASSET_VERSION}`;
}
