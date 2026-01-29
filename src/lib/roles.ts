import type { Role } from './schemas';

// Role constants for type-safe comparisons
export const ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

// Helper functions for role checking
export const isAdmin = (role?: Role | string): boolean => {
  return role === ROLES.ADMIN;
};

export const isMember = (role?: Role | string): boolean => {
  return role === ROLES.MEMBER;
};
