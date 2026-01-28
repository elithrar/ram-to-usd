import type { Config } from "../lib/config.ts";
import { formatMemory, formatPrice, kbToUSD, kbToApple } from "../lib/pricing.ts";

interface TotalBarProps {
  totalRssKB: number;
  config: Config;
}

export function TotalBar({ totalRssKB, config }: TotalBarProps) {
  const usd = kbToUSD(totalRssKB, config);
  const apple = kbToApple(totalRssKB, config);

  return (
    <box
      flexDirection="row"
      borderStyle="single"
      borderColor="gray"
      paddingLeft={1}
      paddingRight={1}
    >
      <text>
        <strong>TOTAL</strong>
      </text>
      <text> | </text>
      <text>
        RAM: <strong fg="cyan">{formatMemory(totalRssKB)}</strong>
      </text>
      <text> | </text>
      <text>
        $USD: <strong fg="green">{formatPrice(usd)}</strong>
      </text>
      <text> | </text>
      <text>
        $APPLE: <strong fg="magenta">{formatPrice(apple)}</strong>
      </text>
    </box>
  );
}
