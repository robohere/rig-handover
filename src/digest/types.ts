// Plan morning-digest § 1. Shapes shared by the reader, the page, the JSON and the board.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of runs/<night>.jsonl, after it parsed.
export type RunLine = {
  at: string;
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

// One row per job. Times keep the offset from the log (styleguide).
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  first: string;
  last: string;
};

export type NightDigest = {
  night: string;
  rows: DigestRow[];
  counts: Record<RunStatus, number>;
  badLines: number;
};

// null when runs/<night>.jsonl does not exist.
export type ReadNight = (runsDir: string, night: string) => NightDigest | null;
