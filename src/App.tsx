import { useKeyboard } from "@opentui/react";
import type { Config } from "./lib/config.ts";
import { useProcessMemory } from "./hooks/useProcessMemory.ts";
import { TotalBar } from "./components/TotalBar.tsx";
import { ProcessTable } from "./components/ProcessTable.tsx";

interface AppProps {
  config: Config;
  onExit: () => void;
}

export function App({ config, onExit }: AppProps) {
  const { processes, totalRssKB } = useProcessMemory(config.refreshIntervalMs);

  useKeyboard((event) => {
    if (event.name === "q" || event.name === "escape") {
      onExit();
    }
  });

  return (
    <box flexDirection="column" width="100%" height="100%">
      <TotalBar totalRssKB={totalRssKB} config={config} />
      <ProcessTable processes={processes} config={config} />
      <box paddingLeft={1}>
        <text fg="gray">Press 'q' to quit</text>
      </box>
    </box>
  );
}
