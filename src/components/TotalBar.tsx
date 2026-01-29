import { useTerminalDimensions } from "@opentui/react";
import type { Config } from "../lib/config.ts";
import { formatMemory, formatPrice, kbToUSD, kbToApple } from "../lib/pricing.ts";

interface TotalBarProps {
  totalRssKB: number;
  config: Config;
}

export function TotalBar({ totalRssKB, config }: TotalBarProps) {
  const { width } = useTerminalDimensions();
  const isNarrow = width < 50;

  const usd = kbToUSD(totalRssKB, config);
  const apple = kbToApple(totalRssKB, config);

  const sep = isNarrow ? " " : " | ";

  return (
    <box
      flexDirection="row"
      borderStyle="single"
      borderColor="gray"
      paddingLeft={1}
      paddingRight={1}
    >
      <text>
        <strong>RAM IN USE</strong>
      </text>
      <text>{sep}</text>
      <text>
        <strong fg="#FFA500">{formatMemory(totalRssKB)}</strong>
        <em fg="gray"> (RSS)</em>
      </text>
      <text>{sep}</text>
      <text>
        <strong fg="red">USD {formatPrice(usd)}</strong>
      </text>
      <text>{sep}</text>
      <text>
        <strong fg="yellow">APPLE {formatPrice(apple)}</strong>
      </text>
    </box>
  );
}
