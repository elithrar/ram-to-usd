## ram-to-usd

RAM is getting expensive. What processes are eating the most $$?

![ramtousd demo](https://github.com/elithrar/ram-to-usd/assets/demo.png)

### Install

```bash
# requires bun and zig
brew install oven-sh/bun/bun zig

# install globally
bun install -g ram-to-usd

# or run directly
bunx ram-to-usd
```

### Build from source

```bash
git clone https://github.com/elithrar/ram-to-usd
cd ram-to-usd
bun install
bun run build  # outputs to dist/ramtousd
```

### Usage

```bash
ramtousd
```

Press `q` or `Escape` to quit.

### Configuration

Create `~/.config/ramtousd.jsonc` to customize pricing:

```jsonc
{
  // PCPartPicker DDR5 average
  "regularPricePerGB": 2.50,
  // Apple's memory upgrade pricing
  "applePricePerGB": 6.25,
  // Refresh interval in ms
  "refreshIntervalMs": 1000
}
```

### License

Apache-2.0
