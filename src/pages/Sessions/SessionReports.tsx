import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { HrService } from '../../services/hr.service';
import { useToast } from '../../context/ToastContext';
import { figma } from '../../assets/figma';
import {
  PersonCell,
  SearchField,
  StatusChip,
  TableCard,
  TableCell,
  TableFooter,
  TableGrid,
  TableMessage,
  TableRow,
  Toolbar,
  ToolbarButton,
} from '../../components/common/DataTable';
import type { ChipTone } from '../../components/common/DataTable';

// Name ≥240, Coach ≥180, Status flex, Date ≥180, Time ≥180 (Figma column widths)
const COLS = 'grid-cols-[minmax(240px,1fr)_minmax(180px,1fr)_minmax(0,1fr)_minmax(180px,1fr)_minmax(180px,1fr)]';

const HEADERS = [
  { label: 'Employee Name' },
  { label: 'Coach Name' },
  { label: 'Status', center: true },
  { label: 'Date' },
  { label: 'Time' },
];

const PAGE_SIZE = 50;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const statusChip = (status: string): { tone: ChipTone; label: string } => {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return { tone: 'success', label: titleCase(status) };
    case 'CANCELLED':
      return { tone: 'danger', label: 'Cancelled' };
    default:
      return { tone: 'warning', label: titleCase(status || 'Pending') };
  }
};

// "11 am" on the hour, "11:30 am" otherwise (Figma: "11 am - 1 pm")
const formatClock = (d: Date) => format(d, d.getMinutes() === 0 ? 'h a' : 'h:mm a').toLowerCase();

const SessionReports: React.FC = () => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await HrService.getCompanySessions(page, PAGE_SIZE, debouncedSearch || undefined);
        if (!isMounted) return;
        // Handle both paginated {sessions, total} and legacy array response
        if (Array.isArray(data)) {
          setSessions(data);
          setTotal(data.length);
        } else {
          setSessions(data.sessions ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSessions();
    return () => { isMounted = false; };
  }, [page, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await HrService.exportCompanySessions(debouncedSearch || undefined);
    } catch (err: any) {
      console.error('Failed to export sessions:', err);
      showToast('Failed to export sessions. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const footer = {
    from: total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
    to: Math.min(page * PAGE_SIZE, total),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };

  return (
    <TableCard>
      <Toolbar>
        <SearchField value={searchTerm} onChange={handleSearchChange} />
        <ToolbarButton variant="outline" icon={figma.fileExport} onClick={handleExport} disabled={exporting}>
          Export all sessions
        </ToolbarButton>
      </Toolbar>

      <TableGrid cols={COLS} headers={HEADERS}>
        {loading ? (
          <TableMessage>
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 animate-spin rounded-full border-4 border-solid border-primary-600 border-t-transparent" />
              <span>Loading session reports...</span>
            </div>
          </TableMessage>
        ) : sessions.length > 0 ? (
          sessions.map((session) => {
            const chip = statusChip(session.status);
            const start = new Date(session.startTime);
            const end = new Date(session.endTime);
            return (
              <TableRow key={session.id} cols={COLS}>
                <TableCell>
                  <PersonCell
                    name={session.employeeName}
                    email={session.employeeEmail && session.employeeEmail !== session.employeeName ? session.employeeEmail : undefined}
                    photo={session.employeePhoto ?? undefined}
                  />
                </TableCell>
                <TableCell>
                  <p className="min-w-0 flex-1 truncate font-geist text-[14px] font-normal leading-6 text-neutral-800">
                    {session.coachName}
                  </p>
                </TableCell>
                <TableCell center className="!px-0">
                  <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
                </TableCell>
                <TableCell>
                  <p className="min-w-0 flex-1 truncate font-geist text-[14px] font-normal leading-6 text-neutral-800">
                    {format(start, 'MMM d, yyyy')}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="min-w-0 flex-1 truncate font-outfit text-[14px] font-normal leading-6 text-neutral-800">
                    {formatClock(start)} - {formatClock(end)}
                  </p>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableMessage>No coaching sessions found for your company.</TableMessage>
        )}
      </TableGrid>

      <TableFooter
        from={footer.from}
        to={footer.to}
        total={footer.total}
        page={page}
        totalPages={footer.totalPages}
        onPageChange={setPage}
      />
    </TableCard>
  );
};

export default SessionReports;
