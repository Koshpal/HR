import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Upload, Plus, MoreVertical, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { HrService } from '../../services/hr.service';
import type { Employee } from '../../types/employee.types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empData, deptData] = await Promise.all([
          HrService.getEmployees(),
          HrService.getDepartments(),
        ]);
        setEmployees(empData);
        setDepartments(deptData);
      } catch (error) {
        console.error('Failed to fetch employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDept]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: Employee) => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDept]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] font-heading">Employee Directory</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your team and monitor their engagement.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button variant="primary" className="gap-2">
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
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[var(--color-text-tertiary)] text-sm font-medium">Loading employees...</span>
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
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">{emp.department}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.status === 'Onboarded' ? 'success' : 'warning'}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        emp.engagement === 'Active' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-tertiary)]'
                      }`} />
                      <span className="text-sm font-bold text-[var(--color-text-secondary)]">{emp.engagement}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--color-text-tertiary)] font-medium">{emp.lastActivity}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center text-[var(--color-text-tertiary)] italic font-medium">
                  No employees found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-6 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]/10 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-tertiary)] font-bold uppercase tracking-wider">
            Showing <span className="text-[var(--color-text-primary)]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[var(--color-text-primary)]">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="text-[var(--color-text-primary)]">{filteredEmployees.length}</span> employees
          </p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev: number) => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev: number) => prev + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeDirectory;
