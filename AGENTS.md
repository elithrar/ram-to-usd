# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project Overview

A macOS TUI that displays RAM usage by process, converted to USD (PCPartPicker DDR5 prices) and Apple dollars. Built with TypeScript, Bun, and OpenTUI React.

## Build & Run Commands

```bash
# Install dependencies
bun install

# Run the TUI
bun run start

# Build standalone binary to dist/ramtousd
bun run build

# Run all checks (lint + format + typecheck)
bun run check

# Individual checks
bun run lint          # oxlint
bun run format        # oxfmt --write
bun run format:check  # oxfmt --check
bun run typecheck     # tsc --noEmit
```

## Testing

No test suite yet. When adding tests:

```bash
# Run all tests
bun test

# Run a single test file
bun test src/lib/pricing.test.ts

# Run tests matching a pattern
bun test --grep "formatPrice"
```

Test file convention: `*.test.ts` next to the source file.

## Code Style

### Formatting (oxfmt)

- 100 char line width
- 2 space indentation, no tabs
- Double quotes for strings
- Semicolons required
- Trailing commas everywhere

### Linting (oxlint)

- `===` required (no `==`)
- `const` preferred over `let`
- `var` prohibited
- `console.log` allowed (it's a TUI)

### TypeScript

Strict mode with all flags enabled:

- `noUncheckedIndexedAccess` - array/object indexing returns `T | undefined`
- `noUnusedLocals` / `noUnusedParameters` - no dead code
- `exactOptionalPropertyTypes` - `undefined` must be explicit
- `noPropertyAccessFromIndexSignature` - use bracket notation for dynamic keys

### Imports

```typescript
// Node.js built-ins: use node: prefix
import { homedir } from "node:os";
import { join } from "node:path";

// Type-only imports: use `type` keyword
import type { Config } from "./lib/config.ts";

// Include .ts/.tsx extensions in relative imports
import { App } from "./App.tsx";
```

### Naming Conventions

- Files: `camelCase.ts` for modules, `PascalCase.tsx` for React components
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE` for true constants, `camelCase` for computed values
- React components: `PascalCase` function names, export named (not default)

### Error Handling

1. Wrap async operations in try/catch
2. Log errors to stderr with `[ramtousd]` prefix
3. Fail gracefully - keep previous state on refresh errors
4. Include context in error messages (exit codes, file paths, etc.)

```typescript
// Good
try {
  const data = await fetchData();
} catch (err) {
  console.error("[ramtousd] fetch failed:", err);
  // Keep previous state, don't crash
}

// Bad
const data = await fetchData(); // Unhandled rejection
```

### Bun APIs

Prefer Bun APIs over Node.js equivalents:

```typescript
// File I/O
const file = Bun.file(path);
const text = await file.text();
const exists = await file.exists();

// JSONC parsing (supports comments)
const config = Bun.JSONC.parse(text);

// Spawning processes
const proc = Bun.spawn(["ps", "-A"], { stdout: "pipe", stderr: "pipe" });
const output = await new Response(proc.stdout).text();
const exitCode = await proc.exited;

// Shell commands (alternative)
const output = await Bun.$`ps -A`.text();
```

### React/OpenTUI Components

```typescript
// Props interface above component
interface TotalBarProps {
  totalRssKB: number;
  config: Config;
}

// Named export, not default
export function TotalBar({ totalRssKB, config }: TotalBarProps) {
  // Hooks at top
  const { width } = useTerminalDimensions();
  
  // Early returns for edge cases
  if (totalRssKB === 0) return null;
  
  // Render
  return (
    <box flexDirection="row">
      <text>...</text>
    </box>
  );
}
```

### OpenTUI-specific

- Use `<box>` for layout, `<text>` for content
- Text styling: `<strong>`, `<em>` inside `<text>`
- Colors: `fg="cyan"`, `fg="green"`, etc. on text elements
- Use `useTerminalDimensions()` for responsive layouts
- Use `useKeyboard((event) => ...)` for key handling - event has `.name` property

## Project Structure

```
src/
├── index.tsx           # Entry point, renderer setup, signal handlers
├── App.tsx             # Main app component, keyboard handling
├── components/
│   ├── TotalBar.tsx    # Summary bar at top
│   └── ProcessTable.tsx # Scrollable process list
├── hooks/
│   └── useProcessMemory.ts # Polling hook for memory data
└── lib/
    ├── config.ts       # Config loading from ~/.config/ramtousd.jsonc
    ├── memory.ts       # Process memory collection via ps
    └── pricing.ts      # KB to USD/Apple conversion
```

## Key Implementation Details

- Process aggregation: child processes grouped under root parent
- Memory: RSS (resident set size) only, not virtual
- Refresh: configurable interval, defaults to 1000ms
- Responsive: layout adapts to terminal width (<50 chars = compact mode)
- Cleanup: SIGINT/SIGTERM handlers restore terminal state

## Dependencies

Runtime:
- `@opentui/core` / `@opentui/react` - TUI framework
- `react` - UI library

Dev:
- `oxlint` - linting
- `oxfmt` - formatting
- `typescript` - type checking
- `@types/bun` / `@types/react` - type definitions

No other runtime dependencies. Uses macOS `ps` command for process data.
