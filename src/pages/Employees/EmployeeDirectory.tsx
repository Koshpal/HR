import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, UserCheck } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { Employee } from '../../types/employee.types';
import AddEmployeeModal from './AddEmployeeModal';
import BulkImportModal from './BulkImportModal';
import EditEmployeeModal from './EditEmployeeModal';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { figma } from '../../assets/figma';
import { FigmaIcon } from '../../components/common/FigmaIcon';
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

// Name ≥240, Department ≥180, Status flex, Engagement ≥180, Actions flex (Figma column widths)
const COLS = 'grid-cols-[minmax(240px,1fr)_minmax(180px,1fr)_minmax(0,1fr)_minmax(180px,1fr)_minmax(0,1fr)]';

const HEADERS = [
  { label: 'Employee Name' },
  { label: 'Department' },
  { label: 'Status', center: true },
  { label: 'Engagement' },
  { label: 'Actions', center: true },
];

const statusChip = (emp: Employee): { tone: ChipTone; label: string } => {
  if (!emp.isActive) return { tone: 'danger', label: 'Deactivated' };
  if (emp.status === 'Onboarded') return { tone: 'success', label: 'Onboarded' };
  if (emp.inviteEmailFailed) return { tone: 'danger', label: 'Invite failed' };
  return { tone: 'warning', label: 'Invited' };
};

const actionButton =
  'flex h-10 items-center justify-center rounded-[8px] px-2.5 transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50';

const EmployeeDirectory: React.FC = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'invited' | 'onboarded' | 'inactive'>('all');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [toDeactivate, setToDeactivate] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const itemsPerPage = 10;

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    HrService.getDepartments()
      .then(setDepartments)
      .catch((error) => console.error('Failed to fetch departments:', error));
  }, [reloadKey]);

  useEffect(() => {
    let ignore = false;
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const result = await HrService.getEmployees({
          page: currentPage,
          pageSize: itemsPerPage,
          search: debouncedSearch || undefined,
          department: selectedDept === 'All' ? undefined : selectedDept,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
        if (ignore) return;
        setEmployees(result.data ?? []);
        setTotal(result.total ?? 0);
        setTotalPages(Math.max(1, result.totalPages ?? 1));
      } catch (error) {
        console.error('Failed to fetch employee data:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchEmployees();
    return () => { ignore = true; };
  }, [currentPage, debouncedSearch, selectedDept, statusFilter, reloadKey]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDeptChange = (value: string) => {
    setSelectedDept(value);
    setCurrentPage(1);
  };

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleAddSuccess = () => {
    // Newest employees sort first, so jump to page 1 and refetch
    setCurrentPage(1);
    reload();
  };

  const handleBulkSuccess = () => {
    setCurrentPage(1);
    reload();
  };

  const handleResendCredentials = async (emp: Employee) => {
    setActionLoading(`resend-${emp.id}`);
    try {
      await HrService.resendCredentials(emp.id);
      showToast(`Credentials resent to ${emp.email}`, 'success');
      reload();
    } catch (err: any) {
      console.error('Failed to resend credentials:', err);
      showToast(err?.response?.data?.message || 'Failed to resend credentials. Please try again.', 'error');
      reload();
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    setActionLoading(`status-${emp.id}`);
    try {
      const res = await HrService.updateEmployeeStatus(emp.id, !emp.isActive);
      const cancelled: number = res?.cancelledSessions ?? 0;
      showToast(
        emp.isActive
          ? `${emp.name} has been deactivated.${cancelled ? ` ${cancelled} upcoming coaching session${cancelled === 1 ? ' was' : 's were'} cancelled and their coach was told.` : ''}`
          : `${emp.name} has been activated.`,
        'success',
      );
      reload();
    } catch (err: any) {
      console.error('Failed to update employee status:', err);
      showToast(err?.response?.data?.message || 'Failed to update employee status. Please try again.', 'error');
    } finally {
      setActionLoading(null);
      setToDeactivate(null);
    }
  };

  const spinner = (
    <div className="size-4 animate-spin rounded-full border-2 border-solid border-primary-600 border-t-transparent" />
  );

  return (
    <>
      <TableCard>
        <Toolbar>
          <SearchField value={searchTerm} onChange={handleSearchChange} />

          <div className="flex flex-wrap items-center gap-4 lg:gap-8">
            <div className="flex items-start gap-3">
              <ToolbarButton variant="filled" icon={figma.plus} onClick={() => setShowAddModal(true)}>
                Add Employee
              </ToolbarButton>
              <ToolbarButton variant="outline" icon={figma.fileImport} onClick={() => setShowBulkModal(true)}>
                Bulk Import
              </ToolbarButton>
            </div>

            <label className="flex h-10 shrink-0 items-center gap-2 rounded-[8px] border border-solid border-neutral-100 px-3 font-outfit text-[14px] text-neutral-700 focus-within:border-primary-600">
              <span className="sr-only">Filter by status</span>
              <select
                aria-label="Filter by status"
                className="bg-transparent outline-none"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1); }}
              >
                <option value="all">All statuses</option>
                <option value="invited">Invited (not signed in)</option>
                <option value="onboarded">Onboarded</option>
                <option value="inactive">Deactivated</option>
              </select>
            </label>

            {/* Department filter: the Figma button face over a native select */}
            <label className="relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[8px] border border-solid border-neutral-100 pl-2.5 pr-4 font-outfit text-[14px] font-normal leading-6 text-neutral-700 transition-colors focus-within:border-primary-600">
              <FigmaIcon src={figma.filter} size={20} />
              <span className="whitespace-nowrap">{selectedDept === 'All' ? 'All Department' : selectedDept}</span>
              <select
                aria-label="Filter by department"
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value)}
              >
                <option value="All">All Department</option>
                {departments.map((dept: string) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </label>
          </div>
        </Toolbar>

        <TableGrid cols={COLS} headers={HEADERS}>
          {loading ? (
            <TableMessage>
              <div className="flex flex-col items-center gap-3">
                <div className="size-10 animate-spin rounded-full border-4 border-solid border-primary-600 border-t-transparent" />
                <span>Loading employees...</span>
              </div>
            </TableMessage>
          ) : employees.length > 0 ? (
            employees.map((emp: Employee) => {
              const chip = statusChip(emp);
              const busy = actionLoading === `resend-${emp.id}` || actionLoading === `status-${emp.id}`;
              return (
                <TableRow key={emp.id} cols={COLS}>
                  <TableCell>
                    <PersonCell name={emp.name || emp.email} email={emp.email} photo={emp.profilePhoto ?? undefined} />
                  </TableCell>
                  <TableCell>
                    <p className="min-w-0 flex-1 truncate font-geist text-[14px] font-normal leading-6 text-neutral-800">
                      {emp.department || '—'}
                    </p>
                  </TableCell>
                  <TableCell center className="!px-0">
                    <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-[6px]">
                      <FigmaIcon src={emp.engagement === 'Active' ? figma.dotActive : figma.dotInactive} size={8} />
                      <span className="whitespace-nowrap font-outfit text-[14px] font-normal leading-6 text-neutral-800">
                        {emp.engagement}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell center>
                    <div className="flex h-11 items-center justify-center">
                      <button
                        type="button"
                        className={actionButton}
                        disabled={!!actionLoading}
                        onClick={() => setEditing(emp)}
                        title="Edit details"
                        aria-label={`Edit ${emp.name}`}
                      >
                        <Pencil className="size-5 text-neutral-600" />
                      </button>
                      {/* Re-sending only makes sense before the first sign-in: after that it would overwrite the employee's own password. */}
                      {emp.isActive && emp.status === 'Invited' && (
                      <button
                        type="button"
                        className={actionButton}
                        disabled={!!actionLoading}
                        onClick={() => handleResendCredentials(emp)}
                        title="Resend credentials"
                        aria-label={`Resend credentials to ${emp.email}`}
                      >
                        {busy && actionLoading === `resend-${emp.id}` ? spinner : <FigmaIcon src={figma.actionResend} size={20} />}
                      </button>
                      )}
                      <button
                        type="button"
                        className={actionButton}
                        disabled={!!actionLoading}
                        onClick={() => (emp.isActive ? setToDeactivate(emp) : handleToggleStatus(emp))}
                        title={emp.isActive ? 'Deactivate employee' : 'Activate employee'}
                        aria-label={emp.isActive ? `Deactivate ${emp.name}` : `Activate ${emp.name}`}
                      >
                        {busy && actionLoading === `status-${emp.id}` ? (
                          spinner
                        ) : emp.isActive ? (
                          <FigmaIcon src={figma.actionTrash} size={20} />
                        ) : (
                          <UserCheck className="size-5 text-success-600" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableMessage>No employees found matching your criteria.</TableMessage>
          )}
        </TableGrid>

        <TableFooter
          from={total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          to={Math.min(currentPage * itemsPerPage, total)}
          total={total}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </TableCard>

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        departments={departments}
      />

      <EditEmployeeModal employee={editing} departments={departments} onClose={() => setEditing(null)} onSaved={() => { showToast('Employee details saved.', 'success'); reload(); }} />

      <Modal isOpen={!!toDeactivate} onClose={() => (actionLoading ? undefined : setToDeactivate(null))} title="Deactivate this employee?">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {toDeactivate?.name} will be signed out and unable to sign in. Any upcoming coaching sessions will be cancelled, their coach will be told, and they will be removed from their coach's list. Their seat is freed and you can reactivate them later.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setToDeactivate(null)} disabled={!!actionLoading}>Keep active</Button>
          <Button onClick={() => toDeactivate && handleToggleStatus(toDeactivate)} disabled={!!actionLoading}>{actionLoading ? 'Deactivating…' : 'Deactivate'}</Button>
        </div>
      </Modal>

      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={handleBulkSuccess}
      />
    </>
  );
};

export default EmployeeDirectory;
