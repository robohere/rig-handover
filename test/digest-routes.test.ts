import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

// runs/ is read-only, so every night here lives in a temp dir.
let runsDir: string;
const ok = (job: string, at: string) => JSON.stringify({ at, job, status: 'ok', owner: 'rook' });

beforeAll(() => {
  runsDir = mkdtempSync(join(tmpdir(), 'rig-runs-'));
  writeFileSync(join(runsDir, '2026-01-01.jsonl'), [ok('b/job', '2026-01-01T01:00:00+01:00'), ok('a/job', '2026-01-01T02:00:00+01:00')].join('\n') + '\n');
  writeFileSync(join(runsDir, '2026-01-02.jsonl'), '');
  writeFileSync(join(runsDir, '2026-01-03.jsonl'), ok('a/job', '2026-01-03T01:00:00+01:00') + '\n{"at":"2026-01-03T02:00:00+01:00","job":"a/j');
});

afterAll(() => rmSync(runsDir, { recursive: true, force: true }));

const app = () => createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir });

describe('GET /digest/:night', () => {
  it('200 with the rows sorted by job', async () => {
    const res = await app().request('/digest/2026-01-01');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html.indexOf('a/job')).toBeGreaterThan(-1);
    expect(html.indexOf('a/job')).toBeLessThan(html.indexOf('b/job'));
  });

  it('404 for a night with no file', async () => {
    expect((await app().request('/digest/2026-02-30')).status).toBe(404);
  });

  it('renders "nothing ran" for an empty night', async () => {
    const res = await app().request('/digest/2026-01-02');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });

  it('still renders a night with a bad line', async () => {
    const res = await app().request('/digest/2026-01-03');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('a/job');
    expect(html).toContain('1 bad line');
  });
});

describe('GET /api/digest/:night', () => {
  it('200 with the same jobs, in the same order, as the page', async () => {
    const res = await app().request('/api/digest/2026-01-01');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rows: { job: string }[] };
    expect(body.rows.map((r) => r.job)).toEqual(['a/job', 'b/job']);
  });

  it('404 for a night with no file', async () => {
    expect((await app().request('/api/digest/2026-02-30')).status).toBe(404);
  });

  it('empty rows for an empty night', async () => {
    const body = (await (await app().request('/api/digest/2026-01-02')).json()) as { rows: unknown[] };
    expect(body.rows).toEqual([]);
  });

  it('counts the bad line', async () => {
    const body = (await (await app().request('/api/digest/2026-01-03')).json()) as { rows: unknown[]; badLines: number };
    expect(body.rows).toHaveLength(1);
    expect(body.badLines).toBe(1);
  });
});
