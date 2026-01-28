import type { Config } from "./config.ts";

const KB_PER_GB = 1024 * 1024;

export function kbToUSD(kb: number, config: Config): number {
  return (kb / KB_PER_GB) * config.regularPricePerGB;
}

export function kbToApple(kb: number, config: Config): number {
  return (kb / KB_PER_GB) * config.applePricePerGB;
}

export function formatMemory(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function formatPrice(amount: number): string {
  return amount < 0.01 ? "<$0.01" : `$${amount.toFixed(2)}`;
}
