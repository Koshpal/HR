import React, { useState, useEffect } from 'react';
import { Download, User, Video, CheckCircle2, Clock, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';

const SessionReports: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await HrService.getCompanySessions(page, PAGE_SIZE);
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
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] font-heading">Session Reports</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Detailed overview of coaching sessions and effectiveness across the company.</p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download className="w-4 h-4" />
          Export All Sessions
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[var(--color-text-tertiary)] text-sm font-medium">Loading session reports...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <TableRow key={session.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">{session.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] font-medium">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {session.coachName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] font-bold">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        {format(new Date(session.startTime), 'MMM dd, yyyy')}
                      </div>
                      <span className="text-xs text-[var(--color-text-tertiary)] mt-0.5 ml-5 font-medium">
                        {format(new Date(session.startTime), 'hh:mm a')} - {format(new Date(session.endTime), 'hh:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={session.status === 'CONFIRMED' ? 'success' : session.status === 'CANCELLED' ? 'error' : 'warning'}
                      className="gap-1.5"
                    >
                      {session.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                      {session.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)]/50 px-2 py-1 rounded-lg border border-[var(--color-border-primary)]">
                      {session.type || '1-on-1 Coaching'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {session.meetingLink ? (
                      <a 
                        href={session.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)]/10 transition-colors text-sm"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </a>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)] text-xs italic font-medium">No Link</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center text-[var(--color-text-tertiary)] italic font-medium">
                  No coaching sessions found for your company.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="p-4 border-t border-[var(--color-border-primary)] flex items-center justify-between bg-[var(--color-bg-secondary)]/10">
            <p className="text-xs text-[var(--color-text-tertiary)] font-bold uppercase tracking-wider">
              Showing <span className="text-[var(--color-text-primary)]">{(page - 1) * PAGE_SIZE + 1}</span>–<span className="text-[var(--color-text-primary)]">{Math.min(page * PAGE_SIZE, total)}</span> of <span className="text-[var(--color-text-primary)]">{total}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" disabled={page * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SessionReports;
