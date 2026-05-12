export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'Invited' | 'Onboarded';
  engagement: 'Active' | 'Inactive';
  lastActivity: string;
  sessionsAttended: number;
  isActive: boolean;
  phone?: string;
  dateOfJoining?: string;
}

export interface Department {
  name: string;
  count: number;
}

export interface UploadBatch {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileName: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  createdAt: string;
  updatedAt: string;
}
