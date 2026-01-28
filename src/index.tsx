import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { loadConfig } from "./lib/config.ts";
import { App } from "./App.tsx";

async function main() {
  const config = await loadConfig();
  const renderer = await createCliRenderer();
  const root = createRoot(renderer);

  function cleanup() {
    renderer.destroy();
    process.exit(0);
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  root.render(<App config={config} onExit={cleanup} />);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
