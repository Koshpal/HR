import { axiosInstance } from './api';
import type { Employee, UploadBatch } from '../types/employee.types';
import type { 
  DashboardStats, 
  FinancialHealthDist, 
  ParticipationDept, 
  DashboardAlert,
  InsightsSummary 
} from '../types/dashboard.types';
import type { HrProfile } from '../types/auth.types';

export const HrService = {
  // Employee Management
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

  updateEmployeeStatus: async (id: string, isActive: boolean): Promise<any> => {
    const response = await axiosInstance.patch(`/hr/employees/${id}/status`, { isActive });
    return response.data;
  },

  uploadEmployees: async (file: File): Promise<{ message: string; batchId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/hr/employees/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Tracking
  getUploads: async (): Promise<UploadBatch[]> => {
    const response = await axiosInstance.get('/hr/uploads');
    return response.data;
  },

  getUploadStatus: async (batchId: string): Promise<UploadBatch> => {
    const response = await axiosInstance.get(`/hr/uploads/${batchId}`);
    return response.data;
  },

  // Dashboard & Insights
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

  // Profile
  getHrProfile: async (): Promise<HrProfile> => {
    const response = await axiosInstance.get('/hr/profile');
    return response.data;
  },

  updateHrProfile: async (data: { fullName?: string; phone?: string; designation?: string }): Promise<any> => {
    const response = await axiosInstance.patch('/hr/profile', data);
    return response.data;
  },
};
