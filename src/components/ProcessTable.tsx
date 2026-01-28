import { useTerminalDimensions } from "@opentui/react";
import type { AggregatedProcess } from "../lib/memory.ts";
import type { Config } from "../lib/config.ts";
import { formatMemory, formatPrice, kbToUSD, kbToApple } from "../lib/pricing.ts";

interface ProcessTableProps {
  processes: AggregatedProcess[];
  config: Config;
}

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  const separators = [" ", "-", "_", ".", "/"];
  for (let i = maxLen - 1; i >= Math.floor(maxLen / 2); i--) {
    if (separators.includes(name[i] ?? "")) return name.slice(0, i);
  }
  return name.slice(0, maxLen - 1) + "~";
}

const pad = (s: string, n: number, left = false) =>
  left ? s.slice(0, n).padStart(n) : s.slice(0, n).padEnd(n);

export function ProcessTable({ processes, config }: ProcessTableProps) {
  const { width, height } = useTerminalDimensions();

  // Responsive column widths based on terminal width
  // Narrow (<50): compact layout with shorter columns
  // Medium (50-80): balanced layout
  // Wide (>80): full layout
  const isNarrow = width < 50;

  const ramW = isNarrow ? 7 : 9;
  const usdW = isNarrow ? 6 : 8;
  const appleW = isNarrow ? 6 : 8;
  const fixedW = ramW + usdW + appleW + 3; // +3 for spaces
  const nameW = Math.max(8, width - fixedW - 2); // -2 for padding

  const tableHeight = Math.max(5, height - 4);

  // Shorter headers for narrow terminals
  const ramHdr = isNarrow ? "RAM" : "RAM";
  const usdHdr = isNarrow ? "USD" : "$USD";
  const appleHdr = isNarrow ? "AAPL" : "$APPLE";

  const header = `${pad("PROCESS", nameW)} ${pad(ramHdr, ramW, true)} ${pad(usdHdr, usdW, true)} ${pad(appleHdr, appleW, true)}`;

  return (
    <box flexDirection="column" flexGrow={1}>
      <box paddingLeft={1} paddingRight={1}>
        <text fg="gray">{header}</text>
      </box>
      <scrollbox height={tableHeight} flexGrow={1}>
        <box flexDirection="column">
          {processes.map((proc) => {
            const suffix = proc.processCount > 1 ? ` (${proc.processCount})` : "";
            const name = truncateName(proc.name + suffix, nameW);

            // Compact formatting for narrow terminals
            const mem = formatMemory(proc.rssKB);
            const usd = formatPrice(kbToUSD(proc.rssKB, config));
            const apple = formatPrice(kbToApple(proc.rssKB, config));

            const row = `${pad(name, nameW)} ${pad(mem, ramW, true)} ${pad(usd, usdW, true)} ${pad(apple, appleW, true)}`;

            return (
              <box key={proc.name} paddingLeft={1} paddingRight={1}>
                <text>{row}</text>
              </box>
            );
          })}
        </box>
      </scrollbox>
    </box>
  );
}
