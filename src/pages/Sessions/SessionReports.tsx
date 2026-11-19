import React, { useEffect, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Guarded, SessionsSummary } from '../../types/dashboard.types';
import { isSuppressed, showGuarded } from '../../utils/privacy';

const STATUS_LABEL: Record<string, string> = { COMPLETED: 'Completed', CONFIRMED: 'Booked (upcoming or not yet closed)', CANCELLED: 'Cancelled' };
const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};

/** One table of "label → count". Hidden counts say so instead of showing a misleading zero. */
const CountTable: React.FC<{ title: string; rows: Array<{ label: string; value: Guarded }>; empty: string; min: number }> = ({ title, rows, empty, min }) => (
  <Card className="p-6">
    <h3 className="mb-4 text-lg font-bold font-heading text-[var(--color-text-primary)]">{title}</h3>
    {rows.length === 0 ? (
      <p className="text-sm text-[var(--color-text-tertiary)]">{empty}</p>
    ) : (
      <ul className="divide-y divide-[var(--color-border-primary)]">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-[var(--color-text-primary)]">{r.label}</span>
            <span className={isSuppressed(r.value) ? 'text-[var(--color-text-tertiary)]' : 'font-semibold text-[var(--color-text-primary)]'} title={isSuppressed(r.value) ? `Fewer than ${min} people` : undefined}>
              {showGuarded(r.value, (n) => n.toLocaleString('en-IN'), 'Hidden')}
            </span>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

const SessionReports: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<SessionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let ignore = false;
    HrService.getSessionsSummary()
      .then((d) => { if (!ignore) setData(d); })
      .catch((e) => { console.error('Failed to fetch sessions summary:', e); if (!ignore) setFailed(true); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await HrService.exportSessionsSummary();
    } catch (err) {
      console.error('Failed to export sessions:', err);
      showToast('Failed to export the report. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="size-10 animate-spin rounded-full border-4 border-solid border-primary-600 border-t-transparent" />
        <span className="text-[var(--color-text-secondary)]">Loading session reports...</span>
      </div>
    );
  }
  if (failed || !data) {
    return <Card className="p-10 text-center"><p className="font-semibold text-[var(--color-text-primary)]">We couldn't load the session report.</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Check your connection and reload the page.</p></Card>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--color-primary)]" />
          <div>
            <p className="font-heading text-lg font-bold text-[var(--color-text-primary)]">Coaching sessions, last {data.windowMonths} months</p>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">{data.privacyNote}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="text-3xl font-bold font-heading text-[var(--color-text-primary)]">{showGuarded(data.totalSessions, (n) => n.toLocaleString('en-IN'), 'Hidden')}</p>
          <Button variant="secondary" className="gap-2" onClick={handleExport} disabled={exporting}>
            <Download className="size-4" />
            {exporting ? 'Preparing…' : 'Export as CSV'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CountTable title="By status" min={data.minCohortSize} empty="No sessions yet."
          rows={data.byStatus.map((r) => ({ label: STATUS_LABEL[r.status] ?? r.status, value: r.sessions }))} />
        <CountTable title="By month" min={data.minCohortSize} empty="No sessions yet."
          rows={[...data.byMonth].reverse().map((r) => ({ label: monthLabel(r.month), value: r.sessions }))} />
        <CountTable title="By department" min={data.minCohortSize} empty="No sessions yet."
          rows={data.byDepartment.map((r) => ({ label: r.department, value: r.sessions }))} />
      </div>
    </div>
  );
};

export default SessionReports;
