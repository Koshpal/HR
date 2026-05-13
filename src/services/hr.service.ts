import { axiosInstance } from './api';
import type { Employee, UploadBatch } from '../types/employee.types';
import type {
  DashboardStats,
  FinancialHealthDist,
  ParticipationDept,
  DashboardAlert,
  InsightsSummary,
} from '../types/dashboard.types';
import type { HrProfile } from '../types/auth.types';

// ─── Request / Response types ─────────────────────────────────────────────────

export interface CreateEmployeePayload {
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  employeeCode?: string;
  joiningDate?: string;
}

export interface CreateEmployeeResult {
  id: string;
  email: string;
  fullName: string;
  department: string | null;
  employeeCode: string | null;
  emailSent: boolean;
  message: string;
}

export interface CsvRowError {
  row: number;
  email: string;
  fullName: string;
  errors: string[];
}

export interface BulkImportResult {
  batchId: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  created: Array<{ id: string; email: string; fullName: string }>;
  errors: CsvRowError[];
  emailFailures: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const HrService = {
  // ── Employee Management ──────────────────────────────────────────────────

  getEmployees: async (): Promise<Employee[]> => {
    const response = await axiosInstance.get('/hr/employees');
    return response.data;
  },

  getDepartments: async (): Promise<string[]> => {
    const response = await axiosInstance.get('/hr/employees/departments/list');
    return response.data;
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const response = await axiosInstance.get(`/hr/employees/${id}`);
    return response.data;
  },

  // ── Create / Bulk ─────────────────────────────────────────────────────────

  createEmployee: async (payload: CreateEmployeePayload): Promise<CreateEmployeeResult> => {
    const response = await axiosInstance.post('/hr/employees', payload);
    return response.data;
  },

  bulkImportEmployees: async (employees: CreateEmployeePayload[]): Promise<BulkImportResult> => {
    const response = await axiosInstance.post('/hr/employees/bulk-import', { employees });
    return response.data;
  },

  uploadCsv: async (file: File): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/hr/employees/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // kept for backwards compat with existing code
  uploadEmployees: async (file: File): Promise<BulkImportResult> => {
    return HrService.uploadCsv(file);
  },

  // ── Employee Actions ──────────────────────────────────────────────────────

  updateEmployeeStatus: async (id: string, isActive: boolean): Promise<any> => {
    const response = await axiosInstance.patch(`/hr/employees/${id}/status`, { isActive });
    return response.data;
  },

  resendCredentials: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post(`/hr/employees/${id}/resend-credentials`);
    return response.data;
  },

  // ── CSV Template ──────────────────────────────────────────────────────────

  downloadCsvTemplate: () => {
    const link = document.createElement('a');
    link.href = `${axiosInstance.defaults.baseURL}/hr/employees/csv-template`;
    link.download = 'koshpal_employees_template.csv';
    link.click();
  },

  // ── Upload History ────────────────────────────────────────────────────────

  getUploads: async (): Promise<UploadBatch[]> => {
    const response = await axiosInstance.get('/hr/uploads');
    return response.data;
  },

  getUploadStatus: async (batchId: string): Promise<UploadBatch> => {
    const response = await axiosInstance.get(`/hr/uploads/${batchId}`);
    return response.data;
  },

  // ── Dashboard & Insights ──────────────────────────────────────────────────

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get('/hr/dashboard/stats');
    return response.data;
  },

  getFinancialHealthDistribution: async (): Promise<FinancialHealthDist> => {
    const response = await axiosInstance.get('/hr/dashboard/financial-health');
    return response.data;
  },

  getParticipationByDepartment: async (): Promise<ParticipationDept[]> => {
    const response = await axiosInstance.get('/hr/dashboard/participation-by-department');
    return response.data;
  },

  getDashboardAlerts: async (): Promise<DashboardAlert[]> => {
    const response = await axiosInstance.get('/hr/dashboard/alerts');
    return response.data;
  },

  getCompanySessions: async (page = 1, pageSize = 50): Promise<any> => {
    const response = await axiosInstance.get('/hr/sessions', { params: { page, pageSize } });
    return response.data;
  },

  getInsightsSummary: async (): Promise<InsightsSummary> => {
    const response = await axiosInstance.get('/hr/insights/summary');
    return response.data;
  },

  // ── Profile ───────────────────────────────────────────────────────────────

  getHrProfile: async (): Promise<HrProfile> => {
    const response = await axiosInstance.get('/hr/profile');
    return response.data;
  },

  updateHrProfile: async (data: {
    fullName?: string;
    phone?: string;
    designation?: string;
  }): Promise<any> => {
    const response = await axiosInstance.patch('/hr/profile', data);
    return response.data;
  },

  uploadProfilePhoto: async (file: File): Promise<{ profilePhoto: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axiosInstance.patch('/hr/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!response.data.profilePhoto) {
        throw new Error('Server did not return a profile photo URL');
      }
      return response.data;
    } catch (error: any) {
      console.error('Profile photo upload failed:', error);
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to upload profile photo'
      );
    }
  },

  removeProfilePhoto: async (): Promise<any> => {
    try {
      const response = await axiosInstance.patch('/hr/profile/photo/remove');
      return response.data;
    } catch (error: any) {
      console.error('Profile photo removal failed:', error);
      throw new Error(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to remove profile photo'
      );
    }
  },
};
