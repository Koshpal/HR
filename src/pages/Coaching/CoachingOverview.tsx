import React, { useCallback, useEffect, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { axiosInstance } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type Hidden = { suppressed: true; reason: 'SMALL_COHORT' };
type Num = number | Hidden;
interface Overview {
  minCohortSize: number; eligibleEmployees: number; enrolledEmployees: Num; participationRatePct: Num; programCompletions: Num; sessionsCompleted: Num;
  completedBySessionNumber: Record<string, Num>; completedByMonth: Record<string, Num>; enrolledByDepartment: Record<string, Num>; actionItemCompletionPct: Num; privacyNote: string;
}
const isHidden = (v: Num): v is Hidden => typeof v === 'object' && v !== null;

const Value: React.FC<{ v: Num; suffix?: string }> = ({ v, suffix = '' }) =>
  isHidden(v) ? <span className="text-[var(--color-text-tertiary)]" title="Hidden to protect privacy: fewer people than the minimum group size">Hidden</span> : <>{v.toLocaleString('en-IN')}{suffix}</>;

const Big: React.FC<{ title: string; v: Num; suffix?: string; hint?: string }> = ({ title, v, suffix, hint }) => (
  <Card className="flex flex-col gap-1"><p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">{title}</p>
    <p className="text-3xl font-bold font-heading text-[var(--color-text-primary)]"><Value v={v} suffix={suffix} /></p>{hint && <p className="text-xs text-[var(--color-text-secondary)]">{hint}</p>}</Card>
);

const Breakdown: React.FC<{ title: string; data: Record<string, Num>; empty: string }> = ({ title, data, empty }) => {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => (isHidden(v) ? 0 : v)));
  return (
    <Card><h2 className="mb-4 text-base font-bold font-heading text-[var(--color-text-primary)]">{title}</h2>
      {!entries.length ? <p className="text-sm text-[var(--color-text-tertiary)]">{empty}</p> : (
        <ul className="flex flex-col gap-3">{entries.map(([k, v]) => (
          <li key={k} className="grid grid-cols-[8rem_1fr_4rem] items-center gap-3 text-sm"><span className="truncate text-[var(--color-text-secondary)]">{k}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]" role="img" aria-label={isHidden(v) ? `${k}: hidden` : `${k}: ${v}`}>{!isHidden(v) && <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${(v / max) * 100}%` }} />}</div>
            <span className="text-right font-semibold"><Value v={v} /></span></li>))}</ul>)}
    </Card>
  );
};

/** Coaching programme for the whole company, as numbers only. No names, notes, goals or individual progress exist on this page. */
const CoachingOverview: React.FC = () => {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => axiosInstance.get<Overview>('/hr/coaching/overview').then((r) => { setData(r.data); setError(null); }).catch((e) => setError(e?.response ? (e.response.data?.message ?? 'Could not load the overview.') : 'Cannot reach the server.')), []);
  useEffect(() => { void load(); }, [load]);

  const download = async () => {
    setBusy(true);
    try {
      const r = await axiosInstance.get('/hr/coaching/overview.csv', { responseType: 'blob' });
      const url = URL.createObjectURL(r.data as Blob);
      const a = document.createElement('a'); a.href = url; a.download = `coaching-overview-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { setError('Could not export the CSV. Please try again.'); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col justify-between gap-4 rounded-[2.5rem] border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-8 shadow-sm md:flex-row md:items-end">
        <div className="space-y-2"><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Financial coaching</p>
          <h1 className="text-3xl font-bold font-heading text-[var(--color-text-primary)]">Coaching programme</h1>
          <p className="max-w-xl text-sm text-[var(--color-text-secondary)]">How your people are using coaching, in aggregate. Individual conversations, finances and progress are private and are never shown here.</p></div>
        <Button onClick={download} isLoading={busy} disabled={!data}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </header>
      {error && <p role="alert" className="rounded-2xl bg-[var(--color-error)]/10 px-5 py-3 text-sm text-[var(--color-error)]">{error}</p>}
      {!data ? (error ? null : <div className="h-40 animate-pulse rounded-3xl bg-[var(--color-bg-tertiary)]" aria-busy="true" />) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Big title="Eligible employees" v={data.eligibleEmployees} /><Big title="Enrolled" v={data.enrolledEmployees} /><Big title="Participation" v={data.participationRatePct} suffix="%" /><Big title="Programme completions" v={data.programCompletions} />
            <Big title="Sessions completed" v={data.sessionsCompleted} /><Big title="Action items completed" v={data.actionItemCompletionPct} suffix="%" hint="Share of agreed actions marked done" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Breakdown title="Sessions completed by session" data={data.completedBySessionNumber} empty="No sessions completed yet." />
            <Breakdown title="Sessions completed by month" data={data.completedByMonth} empty="No sessions completed yet." />
            <Breakdown title="Enrolled by department" data={data.enrolledByDepartment} empty="No one is enrolled yet." />
            <Card className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" /><div className="text-sm text-[var(--color-text-secondary)]"><p className="font-semibold text-[var(--color-text-primary)]">Why some figures say “Hidden”</p><p className="mt-1">{data.privacyNote} The current minimum group size is {data.minCohortSize}. When one group in a breakdown is hidden, the next smallest is hidden too so it cannot be worked out by subtraction.</p></div></Card>
          </div>
        </>)}
    </div>
  );
};

export default CoachingOverview;
