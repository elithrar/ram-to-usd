import { homedir } from "node:os";
import { join } from "node:path";

export interface Config {
  regularPricePerGB: number;
  applePricePerGB: number;
  refreshIntervalMs: number;
}

const DEFAULTS: Config = {
  regularPricePerGB: 2.5, // PCPartPicker DDR5 average ~$2.50/GB
  applePricePerGB: 6.25, // Apple's memory upgrade cost ~$200/32GB
  refreshIntervalMs: 1000,
};

const CONFIG_PATH = join(homedir(), ".config", "ramtousd.jsonc");

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) {
    return DEFAULTS;
  }

  try {
    const text = await file.text();
    const parsed = Bun.JSONC.parse(text) as Partial<Config>;
    const merged = { ...DEFAULTS, ...parsed };

    // Validate and clamp to safe values
    if (typeof merged.refreshIntervalMs !== "number" || merged.refreshIntervalMs < 100) {
      merged.refreshIntervalMs = DEFAULTS.refreshIntervalMs;
    }
    if (typeof merged.regularPricePerGB !== "number" || merged.regularPricePerGB < 0) {
      merged.regularPricePerGB = DEFAULTS.regularPricePerGB;
    }
    if (typeof merged.applePricePerGB !== "number" || merged.applePricePerGB < 0) {
      merged.applePricePerGB = DEFAULTS.applePricePerGB;
    }

    return merged;
  } catch (err) {
    console.error(`[ramtousd] failed to parse ${CONFIG_PATH}, using defaults:`, err);
    return DEFAULTS;
  }
}
