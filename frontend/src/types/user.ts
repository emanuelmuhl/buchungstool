export enum UserRole {
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateUserDto {
  username?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  newPassword?: string;
}
