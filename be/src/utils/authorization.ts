import { GLOBAL_ROLES, PART_SCOPED_ROLES } from "../constants/common";

export const isGlobalRole = (role: string): boolean => {
  return GLOBAL_ROLES.includes(role as (typeof GLOBAL_ROLES)[number]);
};

export const isPartScopedRole = (role: string): boolean => {
  return PART_SCOPED_ROLES.includes(role as (typeof PART_SCOPED_ROLES)[number]);
};

export const canManageDepartment = (role: string, authDepartment: string, targetDepartment: string) => {
  if (isGlobalRole(role)) {
    return true;
  }

  if (isPartScopedRole(role)) {
    return authDepartment === targetDepartment;
  }

  return false;
};
