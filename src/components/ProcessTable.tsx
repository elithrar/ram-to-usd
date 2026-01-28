import { useTerminalDimensions } from "@opentui/react";
import type { AggregatedProcess } from "../lib/memory.ts";
import type { Config } from "../lib/config.ts";
import { formatMemory, formatPrice, kbToUSD, kbToApple } from "../lib/pricing.ts";

interface ProcessTableProps {
  processes: AggregatedProcess[];
  config: Config;
}

function truncate(s: string, max: number): string {
  if (max <= 0) return "";
  if (s.length <= max) return s;
  const seps = [" ", "-", "_", ".", "/"];
  for (let i = max - 1; i >= max / 2; i--) {
    if (seps.includes(s[i] ?? "")) return s.slice(0, i);
  }
  return s.slice(0, max - 1) + "~";
}

export function ProcessTable({ processes, config }: ProcessTableProps) {
  const { width, height } = useTerminalDimensions();

  // Total usable width (1 char left pad)
  const totalW = Math.max(30, width - 1);

  // Fixed column widths - these don't scale
  const ramW = 9; // "28.86 GB"
  const usdW = 7; // "$72.16"
  const appleW = 7; // "$180.40"
  const gaps = 3; // spaces between columns

  // Name column is flexible
  const nameW = Math.max(8, totalW - ramW - usdW - appleW - gaps);

  // Account for: TotalBar (~3 rows), header (1), divider (1), footer (1)
  const tableHeight = Math.max(5, height - 6);

  // Format a row - ensures exact width
  const row = (n: string, r: string, u: string, a: string) =>
    `${truncate(n, nameW).padEnd(nameW)} ${r.padStart(ramW)} ${u.padStart(usdW)} ${a.padStart(appleW)}`;

  const header = row("PROCESS", "RAM", "$USD", "$APPLE");
  const divider = "\u2500".repeat(totalW);

  return (
    <box flexDirection="column" flexGrow={1}>
      <box paddingLeft={1}>
        <text fg="gray">{header}</text>
      </box>
      <box paddingLeft={1}>
        <text fg="gray">{divider}</text>
      </box>
      <scrollbox height={tableHeight} flexGrow={1}>
        <box flexDirection="column">
          {processes.map((proc, idx) => {
            const suffix = proc.processCount > 1 ? ` (${proc.processCount})` : "";
            const line = row(
              proc.name + suffix,
              formatMemory(proc.rssKB),
              formatPrice(kbToUSD(proc.rssKB, config)),
              formatPrice(kbToApple(proc.rssKB, config)),
            );

            return (
              <box key={`${proc.name}-${idx}`} paddingLeft={1}>
                <text>{line}</text>
              </box>
            );
          })}
        </box>
      </scrollbox>
    </box>
  );
}
