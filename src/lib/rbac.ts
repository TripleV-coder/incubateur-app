import type { UserRole } from "@prisma/client";

export type AppRole = UserRole;

export const roleHomePath: Record<AppRole, string> = {
  ADMIN: "/dashboard/admin",
  COACH: "/dashboard/coach",
  STUDENT: "/dashboard",
};

export function canAccessAdmin(role?: UserRole) {
  return role === "ADMIN";
}

export function canAccessCoach(role?: UserRole) {
  return role === "COACH" || role === "ADMIN";
}

export function isStudent(role?: UserRole) {
  return role === "STUDENT";
}

export function isStaff(role?: UserRole) {
  return role === "ADMIN" || role === "COACH";
}

export type DashboardSidebarItem = {
  href: string;
  label: string;
  icon: "dashboard" | "courses" | "coaching" | "admin";
  tone?: "default" | "coach" | "admin";
  match?: "exact" | "prefix";
};

export function getSidebarItemsForRole(role?: UserRole): DashboardSidebarItem[] {
  if (role === "ADMIN") {
    return [
      {
        href: roleHomePath.ADMIN,
        label: "Vue Globale",
        icon: "dashboard",
        tone: "admin",
        match: "exact",
      },
      {
        href: "/dashboard/admin/courses",
        label: "Gestion Formations",
        icon: "courses",
        tone: "admin",
        match: "prefix",
      },
      {
        href: "/dashboard/coach",
        label: "Coaching",
        icon: "coaching",
        tone: "coach",
        match: "prefix",
      },
      {
        href: "/courses",
        label: "Catalogue LMS",
        icon: "courses",
        match: "prefix",
      },
    ];
  }

  if (role === "COACH") {
    return [
      {
        href: roleHomePath.COACH,
        label: "Dashboard Coach",
        icon: "coaching",
        tone: "coach",
        match: "exact",
      },
      { href: "/courses", label: "Mes Formations", icon: "courses", match: "prefix" },
    ];
  }

  return [
    { href: roleHomePath.STUDENT, label: "Dashboard", icon: "dashboard", match: "exact" },
    { href: "/courses", label: "Mes Formations", icon: "courses", match: "prefix" },
  ];
}
