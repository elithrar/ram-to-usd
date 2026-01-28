import { useState, useEffect } from "react";
import { getProcessMemory, aggregateByParent, type AggregatedProcess } from "../lib/memory.ts";

export interface MemoryData {
  processes: AggregatedProcess[];
  totalRssKB: number;
}

export function useProcessMemory(intervalMs: number): MemoryData {
  const [data, setData] = useState<MemoryData>({ processes: [], totalRssKB: 0 });

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const raw = await getProcessMemory();
        const aggregated = aggregateByParent(raw);
        const totalRssKB = aggregated.reduce((sum, p) => sum + p.rssKB, 0);

        if (mounted) {
          setData({ processes: aggregated, totalRssKB });
        }
      } catch (err) {
        // Log to stderr but keep previous data - don't crash the app
        console.error("[ramtousd] refresh failed:", err);
      }
    }

    refresh();
    const id = setInterval(refresh, intervalMs);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return data;
}
