import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { Employee } from '../../types/employee.types';
import AddEmployeeModal from './AddEmployeeModal';
import BulkImportModal from './BulkImportModal';
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
  }, [currentPage, debouncedSearch, selectedDept, reloadKey]);

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
      await HrService.updateEmployeeStatus(emp.id, !emp.isActive);
      setEmployees((prev) =>
        prev.map((e) => e.id === emp.id ? { ...e, isActive: !e.isActive } : e),
      );
      showToast(
        `${emp.name} has been ${emp.isActive ? 'deactivated' : 'activated'} successfully.`,
        'success',
      );
    } catch (err: any) {
      console.error('Failed to update employee status:', err);
      showToast(err?.response?.data?.message || 'Failed to update employee status. Please try again.', 'error');
    } finally {
      setActionLoading(null);
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
                        onClick={() => handleResendCredentials(emp)}
                        title="Resend credentials"
                        aria-label={`Resend credentials to ${emp.email}`}
                      >
                        {busy && actionLoading === `resend-${emp.id}` ? spinner : <FigmaIcon src={figma.actionResend} size={20} />}
                      </button>
                      <button
                        type="button"
                        className={actionButton}
                        disabled={!!actionLoading}
                        onClick={() => handleToggleStatus(emp)}
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

      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={handleBulkSuccess}
      />
    </>
  );
};

export default EmployeeDirectory;
