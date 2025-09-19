import { withBase } from "./paths";

export function asset(path: string): string {
  return withBase(path);
}
