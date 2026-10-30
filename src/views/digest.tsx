import type { NightDigest } from '../digest/types.js';

const dash = (v: string | null) => v ?? '—';

export function DigestPage({ digest }: { digest: NightDigest }) {
  const { night, rows, counts, badLines } = digest;
  return (
    <>
      <h1>digest · {night}</h1>
      <p class="mute">
        ok {counts.ok} · retry {counts.retry} · fail {counts.fail}
        {badLines > 0 ? <span class="warn"> · {badLines} bad line{badLines === 1 ? '' : 's'} skipped</span> : ''}
      </p>
      {rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th><th>owner</th><th>runs</th><th>retries</th><th>last status</th>
              <th>last error</th><th>first</th><th>last</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr>
                <td>{r.job}</td>
                <td>{dash(r.owner)}</td>
                <td>{r.runs}</td>
                <td>{r.retries >= 3 ? <strong class="warn">{r.retries} ▲</strong> : r.retries}</td>
                <td>{r.lastStatus === 'fail' ? <strong class="warn">fail ✕</strong> : r.lastStatus}</td>
                <td>{dash(r.lastError)}</td>
                <td>{r.first}</td>
                <td>{r.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
