import React, { useEffect, useState } from 'react';
import { Download, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { Guarded, ImpactSummary } from '../../types/dashboard.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { hiddenNote, isSuppressed } from '../../utils/privacy';

const HIDDEN_TITLE = 'Hidden to protect privacy: fewer people than the minimum group size are behind this figure';

/** A figure, or a plain "Hidden" when the server held it back. */
const Val: React.FC<{ v: Guarded | undefined; suffix?: string; signed?: boolean }> = ({ v, suffix = '', signed }) => {
  if (v === undefined) return <>—</>;
  if (isSuppressed(v)) return <span className="text-[var(--color-text-tertiary)]" title={HIDDEN_TITLE}>Hidden</span>;
  const text = v.toLocaleString('en-IN');
  return <>{signed && v > 0 ? '+' : ''}{text}{suffix}</>;
};

const Tile: React.FC<{ title: string; hint?: React.ReactNode; children: React.ReactNode }> = ({ title, hint, children }) => (
  <Card className="flex flex-col gap-1">
    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">{title}</p>
    <p className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">{children}</p>
    {hint && <p className="text-xs text-[var(--color-text-secondary)]">{hint}</p>}
  </Card>
);

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <section className="space-y-4">
    <div>
      <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-[var(--color-text-secondary)]">{subtitle}</p>}
    </div>
    {children}
  </section>
);

/** One labelled horizontal bar; a hidden value draws an empty track and says so. */
const BarRow: React.FC<{ label: string; value: Guarded; max?: number; right?: React.ReactNode; tone?: 'primary' | 'warning' }> = ({ label, value, max = 100, right, tone = 'primary' }) => {
  const hidden = isSuppressed(value);
  const width = hidden ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <li className="grid grid-cols-1 items-center gap-2 text-sm sm:grid-cols-[minmax(0,15rem)_1fr_5rem] sm:gap-3">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <div
        className="h-3 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]"
        role="img"
        aria-label={hidden ? `${label}: hidden` : `${label}: ${value}`}
      >
        {!hidden && (
          <div
            className={`h-full rounded-full ${tone === 'warning' ? 'bg-warning-500' : 'bg-[var(--color-primary)]'}`}
            style={{ width: `${width}%` }}
          />
        )}
      </div>
      <span className="text-right font-semibold text-[var(--color-text-primary)] sm:text-right">{right ?? <Val v={value} suffix="%" />}</span>
    </li>
  );
};

const monthLabel = (ym: string) => new Date(`${ym}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

const Impact: React.FC = () => {
  const [data, setData] = useState<ImpactSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumped by "Try again"

  useEffect(() => {
    let ignore = false;
    HrService.getImpact()
      .then((d) => { if (!ignore) { setData(d); setError(null); } })
      .catch((e: unknown) => {
        if (ignore) return;
        const res = (e as { response?: { data?: { message?: string } } })?.response;
        setError(res ? (res.data?.message ?? 'Could not load the impact report.') : 'Cannot reach the server.');
      });
    return () => { ignore = true; };
  }, [attempt]);

  const download = async () => {
    setExporting(true);
    try { await HrService.exportImpact(); } catch { setError('Could not export the CSV. Please try again.'); } finally { setExporting(false); }
  };

  if (!data) {
    return error ? (
      <Card className="p-10 text-center">
        <p className="font-semibold text-[var(--color-text-primary)]">We couldn't load the impact report.</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{error}</p>
        <Button className="mt-4" onClick={() => { setError(null); setAttempt((n) => n + 1); }}>Try again</Button>
      </Card>
    ) : (
      <div className="flex min-h-[60vh] flex-col items-center justify-center" aria-busy="true">
        <div className="size-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        <p className="mt-4 font-medium text-[var(--color-text-secondary)]">Building your impact report…</p>
      </div>
    );
  }

  const o = data.outcomes;
  const c = data.coaching;
  const cmp = c.scoreChangeComparison;
  const trendMax = Math.max(100, ...o.trend.map((t) => (isSuppressed(t.avgScore) ? 0 : t.avgScore)));
  const shownTrend = o.trend.filter((t) => !isSuppressed(t.avgScore));
  const anyHidden = [o.avgScoreChange, o.currentAvgScore, c.sessionsCompleted, ...data.funnel.map((f) => f.count)].some(isSuppressed);

  return (
    <div className="animate-fade-in space-y-10">
      <header className="flex flex-col justify-between gap-6 rounded-[2.5rem] border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-8 shadow-sm md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Programme impact</p>
          <h1 className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">What Koshpal is doing for your people</h1>
          <p className="max-w-2xl text-sm font-medium text-[var(--color-text-secondary)]">
            How many employees are using it, how their financial health is moving and where they need help, and the coaching delivered. Combined figures only.
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <Button variant="secondary" className="gap-2" onClick={() => window.print()}><Printer className="h-4 w-4" />Print / save as PDF</Button>
          <Button className="gap-2" onClick={download} isLoading={exporting}><Download className="h-4 w-4" />Export CSV</Button>
        </div>
      </header>

      {error && <p role="alert" className="rounded-2xl bg-[var(--color-error)]/10 px-5 py-3 text-sm text-[var(--color-error)]">{error}</p>}

      {/* The one-paragraph answer to "what are we getting for this?" */}
      <Card className="border-[var(--color-primary)]/30 bg-[var(--color-bg-secondary)]">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
          <div className="space-y-2">
            <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">Value delivered</h2>
            {data.headlines.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Impact figures appear once at least {data.minCohortSize} employees are behind them. With {data.activeEmployees} active employee{data.activeEmployees === 1 ? '' : 's'}
                {' '}so far, ask more employees to sign in, share their data with HR and book a coaching session to see results here.
              </p>
            ) : (
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--color-text-primary)]">
                {data.headlines.map((h) => <li key={h.text} className={h.tone === 'positive' ? 'font-medium' : ''}>{h.text}</li>)}
              </ul>
            )}
          </div>
        </div>
      </Card>

      <Section title="Are people using it?" subtitle={`Of your ${data.activeEmployees} active employees, how many have taken each step.`}>
        <Card>
          <ul className="flex flex-col gap-4">
            {data.funnel.map((f) => (
              <BarRow
                key={f.key}
                label={f.label}
                value={f.pct}
                right={<><Val v={f.pct} suffix="%" /> <span className="font-normal text-[var(--color-text-tertiary)]">(<Val v={f.count} />)</span></>}
              />
            ))}
          </ul>
        </Card>
      </Section>

      <Section
        title="Is their financial health improving?"
        subtitle={`Compares each employee's first and latest financial health score over the last ${o.windowDays} days. Includes only employees who chose to share with HR.`}
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Tile title="Sharing with HR" hint="Employees whose scores are included"><Val v={o.sharingEmployees} /></Tile>
          <Tile title="Average score now" hint="Out of 100"><Val v={o.currentAvgScore} /></Tile>
          <Tile title="Average change" hint={isSuppressed(o.avgStartScore) || isSuppressed(o.avgLatestScore) ? undefined : `From ${o.avgStartScore} to ${o.avgLatestScore}`}><Val v={o.avgScoreChange} signed suffix=" pts" /></Tile>
          <Tile title="Improved" hint="Gained 2+ points"><Val v={o.improvedPct} suffix="%" /></Tile>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-heading text-base font-bold text-[var(--color-text-primary)]">How scores moved</h3>
            <ul className="flex flex-col gap-4">
              <BarRow label="Improved" value={o.improvedPct} />
              <BarRow label="Stayed about the same" value={o.steadyPct} />
              <BarRow label="Declined" value={o.declinedPct} tone="warning" />
            </ul>
          </Card>
          <Card>
            <h3 className="mb-4 font-heading text-base font-bold text-[var(--color-text-primary)]">Average score by month</h3>
            {shownTrend.length < 2 ? (
              <p className="text-sm text-[var(--color-text-tertiary)]">A trend appears once at least two months have enough employees behind them.</p>
            ) : (
              <div className="flex h-44 items-stretch gap-3" role="img" aria-label={`Average score by month: ${shownTrend.map((t) => `${monthLabel(t.month)} ${t.avgScore as number}`).join(', ')}`}>
                {shownTrend.map((t) => (
                  <div key={t.month} className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col items-center justify-end">
                      <span className="pb-1 text-xs font-semibold text-[var(--color-text-primary)]">{t.avgScore as number}</span>
                      <div className="w-full rounded-t-lg bg-[var(--color-primary)]" style={{ height: `${((t.avgScore as number) / trendMax) * 120}px` }} />
                    </div>
                    <span className="pt-1 text-center text-[11px] text-[var(--color-text-tertiary)]">{monthLabel(t.month)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Section>

      <Section title="Where do employees need help?" subtitle="Average strength in each part of the financial health score, as a share of the best possible. The lowest is the biggest opportunity.">
        <Card>
          <ul className="flex flex-col gap-4">
            {o.focusAreas.map((a, i) => (
              <BarRow key={a.key} label={a.label} value={a.avgPctOfMax} tone={i === 0 && !isSuppressed(a.avgPctOfMax) ? 'warning' : 'primary'} />
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Coaching delivered" subtitle="One-to-one financial coaching with a Koshpal coach.">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Tile title="Employees coached" hint="Completed at least one session"><Val v={c.employeesCoached} /></Tile>
          <Tile title="Share of employees"><Val v={c.coachedPct} suffix="%" /></Tile>
          <Tile title="Sessions completed"><Val v={c.sessionsCompleted} /></Tile>
          <Tile title="Coaching hours"><Val v={c.hoursDelivered} /></Tile>
        </div>
        <Card>
          <h3 className="mb-1 font-heading text-base font-bold text-[var(--color-text-primary)]">Score change: coached vs not yet coached</h3>
          {isSuppressed(cmp) ? (
            <p className="text-sm text-[var(--color-text-tertiary)]" title={HIDDEN_TITLE}>
              Hidden until at least {data.minCohortSize} employees are in both groups, so neither group can be identified.
            </p>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[var(--color-bg-secondary)] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Coached ({cmp.coached.employees})</p>
                <p className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">{cmp.coached.avgChange > 0 ? '+' : ''}{cmp.coached.avgChange} pts</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-bg-secondary)] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Not yet coached ({cmp.notCoached.employees})</p>
                <p className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">{cmp.notCoached.avgChange > 0 ? '+' : ''}{cmp.notCoached.avgChange} pts</p>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">{c.comparisonNote}</p>
        </Card>
      </Section>

      <Section title="Money habits" subtitle="Employees who have started building good habits in the app.">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Tile title="Using a budget"><Val v={data.habits.employeesWithBudget} /></Tile>
          <Tile title="Saving towards a goal"><Val v={data.habits.employeesWithGoal} /></Tile>
          <Tile title="Reached a goal"><Val v={data.habits.employeesReachingAGoal} /></Tile>
          <Tile title="Coaching actions done" hint="Share of agreed actions completed"><Val v={data.habits.actionItemCompletionPct} suffix="%" /></Tile>
        </div>
      </Section>

      <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-secondary)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
        <p>
          {data.privacyNote} {anyHidden ? hiddenNote(data.minCohortSize) : ''}
        </p>
      </div>
    </div>
  );
};

export default Impact;
