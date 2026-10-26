import { User } from '../types/auth';

export const DUMMY_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Admin@123',
};

export const DEFAULT_ADMIN_USER: User = {
  id: 'usr_admin_001',
  fullName: 'Administrator',
  email: 'admin@example.com',
  mobileNumber: '+91 98765 43210',
  role: 'admin',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-01-15T08:00:00Z',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  IS_AUTHENTICATED: 'is_authenticated',
  REGISTERED_USERS: 'registered_users_list',
  SUBMITTED_RESULTS: 'submitted_qr_results',
  REMEMBER_ME: 'remember_me_email',
  SCANNER_CAMERA_FACING: 'scanner_camera_facing',
} as const;
