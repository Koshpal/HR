export interface User {
  id: string;
  name: string;
  email: string;
  role: 'HR' | 'EMPLOYEE' | 'COACH';
  companyId: string;
  profilePhoto?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface HrProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  designation?: string;
  companyId: string;
  profilePhoto?: string;
}
