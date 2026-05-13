import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Filter, Upload, Plus, MoreVertical,
  ChevronLeft, ChevronRight, Mail, RefreshCw, UserCheck, UserX,
} from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { CreateEmployeeResult, BulkImportResult } from '../../services/hr.service';
import type { Employee } from '../../types/employee.types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import AddEmployeeModal from './AddEmployeeModal';
import BulkImportModal from './BulkImportModal';

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Per-row action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, deptData] = await Promise.all([
        HrService.getEmployees(),
        HrService.getDepartments(),
      ]);
      const employeeList = Array.isArray(empData)
        ? empData
        : ((empData as any)?.data || (empData as any)?.employees || []);
      setEmployees(employeeList);
      setDepartments(deptData);
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedDept]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: Employee) => {
      const matchesSearch =
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDept]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleAddSuccess = (employee: CreateEmployeeResult) => {
    setEmployees((prev) => [
      {
        id: employee.id,
        name: employee.fullName,
        email: employee.email,
        department: employee.department ?? '',
        role: 'Employee',
        status: 'Invited',
        engagement: 'Inactive',
        lastActivity: 'Just added',
        sessionsAttended: 0,
        isActive: true,
      },
      ...prev,
    ]);
    if (employee.department && !departments.includes(employee.department)) {
      setDepartments((prev) => [...prev, employee.department!]);
    }
  };

  const handleBulkSuccess = (_result: BulkImportResult) => {
    fetchData();
  };

  const handleResendCredentials = async (emp: Employee) => {
    setActionLoading(`resend-${emp.id}`);
    setOpenMenuId(null);
    try {
      await HrService.resendCredentials(emp.id);
    } catch (err) {
      console.error('Failed to resend credentials:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    setActionLoading(`status-${emp.id}`);
    setOpenMenuId(null);
    try {
      await HrService.updateEmployeeStatus(emp.id, !emp.isActive);
      setEmployees((prev) =>
        prev.map((e) => e.id === emp.id ? { ...e, isActive: !e.isActive } : e),
      );
    } catch (err) {
      console.error('Failed to update employee status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] font-heading">
            Employee Directory
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Manage your team and monitor their engagement.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2" onClick={() => setShowBulkModal(true)}>
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button variant="primary" className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]/30 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="w-full md:w-96">
            <Input
              icon={Search}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              <Filter className="w-4 h-4" />
              <span>Department:</span>
            </div>
            <select
              className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((dept: string) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[var(--color-text-tertiary)] text-sm font-medium">
                      Loading employees...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp: Employee) => (
                <TableRow key={emp.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold transition-transform group-hover:scale-110">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-text-primary)] text-sm">{emp.name}</p>
                        <div className="flex items-center gap-1 text-[var(--color-text-tertiary)] text-xs mt-0.5">
                          <Mail className="w-3 h-3" />
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {emp.department || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.status === 'Onboarded' ? 'success' : 'warning'}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        emp.engagement === 'Active'
                          ? 'bg-[var(--color-success)]'
                          : 'bg-[var(--color-text-tertiary)]'
                      }`} />
                      <span className="text-sm font-bold text-[var(--color-text-secondary)]">
                        {emp.engagement}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--color-text-tertiary)] font-medium">
                      {emp.lastActivity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block" ref={openMenuId === emp.id ? menuRef : null}>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!!actionLoading}
                        onClick={() => setOpenMenuId((id) => id === emp.id ? null : emp.id)}
                      >
                        {actionLoading?.startsWith(emp.id) ? (
                          <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <MoreVertical className="w-4 h-4" />
                        )}
                      </Button>

                      {openMenuId === emp.id && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl shadow-lg z-50 overflow-hidden py-1">
                          <button
                            type="button"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                            onClick={() => handleResendCredentials(emp)}
                          >
                            <RefreshCw className="w-4 h-4 shrink-0 text-[var(--color-text-tertiary)]" />
                            Resend Credentials
                          </button>
                          <button
                            type="button"
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              emp.isActive
                                ? 'text-[var(--color-error)] hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            onClick={() => handleToggleStatus(emp)}
                          >
                            {emp.isActive ? (
                              <UserX className="w-4 h-4 shrink-0" />
                            ) : (
                              <UserCheck className="w-4 h-4 shrink-0" />
                            )}
                            {emp.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-20 text-center text-[var(--color-text-tertiary)] italic font-medium"
                >
                  No employees found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-6 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]/10 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-tertiary)] font-bold uppercase tracking-wider">
            Showing{' '}
            <span className="text-[var(--color-text-primary)]">
              {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="text-[var(--color-text-primary)]">
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
            </span>{' '}
            of{' '}
            <span className="text-[var(--color-text-primary)]">{filteredEmployees.length}</span>{' '}
            employees
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

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
    </div>
  );
};

export default EmployeeDirectory;
