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

  // Total usable width (1 char left pad, 4 chars for scrollbar/right margin)
  const totalW = Math.max(30, width - 5);

  // Fixed column widths
  const pidW = 6; // "12345"
  const ramW = 9; // "18.59 GB"
  const usdW = 8; // "$116.16"
  const appleW = 8; // "$290.40"
  const gaps = 4; // spaces between columns

  // Name column is flexible
  const nameW = Math.max(8, totalW - pidW - ramW - usdW - appleW - gaps);

  // Account for: TotalBar (~3 rows), header (1), divider (1), footer (1)
  const tableHeight = Math.max(5, height - 6);

  // Format a row - ensures exact width
  const row = (p: string, n: string, r: string, u: string, a: string) =>
    `${p.padStart(pidW)} ${truncate(n, nameW).padEnd(nameW)} ${r.padStart(ramW)} ${u.padStart(usdW)} ${a.padStart(appleW)}`;

  const header = row("PID", "App", "RAM", "USD", "APPLE");
  const divider = "\u2500".repeat(totalW);

  // Build all rows as a single string to avoid spacing issues
  const lines = processes.map((proc) => {
    const suffix = proc.processCount > 1 ? ` (${proc.processCount})` : "";
    return row(
      proc.rootPid.toString(),
      proc.name + suffix,
      formatMemory(proc.rssKB),
      formatPrice(kbToUSD(proc.rssKB, config)),
      formatPrice(kbToApple(proc.rssKB, config)),
    );
  });

  return (
    <box flexDirection="column" flexGrow={1}>
      <box paddingLeft={1}>
        <text fg="gray">{header}</text>
      </box>
      <box paddingLeft={1}>
        <text fg="gray">{divider}</text>
      </box>
      <scrollbox height={tableHeight} flexGrow={1}>
        <box paddingLeft={1}>
          <text>{lines.join("\n")}</text>
        </box>
      </scrollbox>
    </box>
  );
}
