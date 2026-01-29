export interface ProcessInfo {
  pid: number;
  ppid: number;
  rssKB: number;
  command: string;
}

export interface AggregatedProcess {
  rootPid: number;
  name: string;
  rssKB: number;
  processCount: number;
}

function extractAppName(command: string): string {
  // Handle .app bundles: extract "App Name" from path
  const appMatch = command.match(/\/([^/]+)\.app\//);
  if (appMatch?.[1]) {
    return appMatch[1];
  }

  // For other commands, get the last path component
  const parts = command.split("/");
  return parts[parts.length - 1] ?? command;
}

export async function getProcessMemory(): Promise<ProcessInfo[]> {
  const proc = Bun.spawn(["ps", "-A", "-o", "pid=,ppid=,rss=,comm="], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [output, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(`ps failed (exit ${exitCode}): ${stderr.trim() || "unknown error"}`);
  }

  const lines = output.trim().split("\n").filter(Boolean);
  const processes: ProcessInfo[] = [];

  for (const line of lines) {
    // Format: "  PID  PPID    RSS COMMAND"
    // Using = suffix in format removes headers
    const match = line.match(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/);
    if (!match) continue;

    const [, pidStr, ppidStr, rssStr, command] = match;
    processes.push({
      pid: parseInt(pidStr ?? "0", 10),
      ppid: parseInt(ppidStr ?? "0", 10),
      rssKB: parseInt(rssStr ?? "0", 10),
      command: command ?? "",
    });
  }

  return processes;
}

export function aggregateByParent(processes: ProcessInfo[]): AggregatedProcess[] {
  // Build a map of pid -> process
  const byPid = new Map<number, ProcessInfo>();
  for (const p of processes) {
    byPid.set(p.pid, p);
  }

  // Find root ancestor for each process
  function findRoot(pid: number, visited = new Set<number>()): number {
    if (visited.has(pid)) return pid; // cycle protection
    visited.add(pid);

    const proc = byPid.get(pid);
    if (!proc || proc.ppid === 0 || proc.ppid === 1 || !byPid.has(proc.ppid)) {
      return pid;
    }
    return findRoot(proc.ppid, visited);
  }

  // Group by root ancestor
  const groups = new Map<number, { processes: ProcessInfo[]; rootCommand: string }>();

  for (const p of processes) {
    const rootPid = findRoot(p.pid);
    const rootProc = byPid.get(rootPid);

    if (!groups.has(rootPid)) {
      groups.set(rootPid, {
        processes: [],
        rootCommand: rootProc?.command ?? p.command,
      });
    }
    groups.get(rootPid)!.processes.push(p);
  }

  // Aggregate each group
  const result: AggregatedProcess[] = [];
  for (const [rootPid, group] of groups) {
    const totalRss = group.processes.reduce((sum, p) => sum + p.rssKB, 0);
    result.push({
      rootPid,
      name: extractAppName(group.rootCommand),
      rssKB: totalRss,
      processCount: group.processes.length,
    });
  }

  // Sort by RSS descending
  result.sort((a, b) => b.rssKB - a.rssKB);

  return result;
}
