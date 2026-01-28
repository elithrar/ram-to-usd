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
  const nameWidth = Math.max(20, width - 40);
  const tableHeight = Math.max(5, height - 5);

  const header = `${pad("PROCESS", nameWidth)} ${pad("RAM", 10, true)} ${pad("$USD", 10, true)} ${pad("$APPLE", 10, true)}`;

  return (
    <box flexDirection="column" flexGrow={1}>
      <box paddingLeft={1} paddingRight={1}>
        <text fg="gray">{header}</text>
      </box>
      <box paddingLeft={1} paddingRight={1}>
        <text fg="gray">{"-".repeat(Math.min(width - 4, header.length))}</text>
      </box>
      <scrollbox height={tableHeight} flexGrow={1}>
        <box flexDirection="column">
          {processes.map((proc) => {
            const suffix = proc.processCount > 1 ? ` (${proc.processCount})` : "";
            const name = truncateName(proc.name + suffix, nameWidth);
            const row = `${pad(name, nameWidth)} ${pad(formatMemory(proc.rssKB), 10, true)} ${pad(formatPrice(kbToUSD(proc.rssKB, config)), 10, true)} ${pad(formatPrice(kbToApple(proc.rssKB, config)), 10, true)}`;

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
