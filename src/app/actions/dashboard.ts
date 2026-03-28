"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { canAccessAdmin, canAccessCoach } from "@/lib/rbac";

export async function getStudentStats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [allEnrollments, completedLessons] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progress.count({
      where: { userId: session.user.id, completed: true },
    }),
  ]);

  const avgProgress =
    allEnrollments.length > 0
      ? Math.round(
          allEnrollments.reduce(
            (sum: number, curr: { progress: number }) => sum + curr.progress,
            0
          ) / allEnrollments.length
        )
      : 0;

  return {
    coursesCount: allEnrollments.length,
    completedLessons,
    avgProgress,
    recentEnrollments: allEnrollments.slice(0, 5),
  };
}

export async function getStudentPayments() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function getPublishedAnnouncements() {
  return prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
    },
  });
}

export async function getStudentNotifications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userTier = session.user.tier ?? "FREE";

  return prisma.notification.findMany({
    where: {
      isPublished: true,
      OR: [{ targetTier: null }, { targetTier: userTier }],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
      reads: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
  });
}

export async function markNotificationAsReadAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) throw new Error("Invalid notification");

  await prisma.notificationRead.upsert({
    where: {
      userId_notificationId: {
        userId: session.user.id,
        notificationId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      notificationId,
    },
  });

  revalidatePath("/dashboard");
}

export async function getAdminStats() {
  const session = await auth();
  if (
    !session?.user?.id ||
    !canAccessAdmin(session.user.role as UserRole | undefined) ||
    session.user.isActive === false
  ) {
    throw new Error("Unauthorized");
  }

  const [totalUsers, totalRevenueAgg, recentPayments] = await Promise.all([
    prisma.user.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalRevenue: totalRevenueAgg._sum.amount?.toNumber() ?? 0,
    recentPayments,
  };
}

export async function getCoachStats() {
  const session = await auth();
  if (
    !session?.user?.id ||
    !canAccessCoach(session.user.role as UserRole | undefined) ||
    session.user.isActive === false
  ) {
    throw new Error("Unauthorized");
  }

  const coachOnly = session.user.role === UserRole.COACH;
  const studentBase = coachOnly
    ? { role: UserRole.STUDENT, coachId: session.user.id }
    : { role: UserRole.STUDENT };

  const studentIdsForActivity = coachOnly
    ? (
        await prisma.user.findMany({
          where: { role: UserRole.STUDENT, coachId: session.user.id },
          select: { id: true },
        })
      ).map((u) => u.id)
    : null;

  const [totalStudents, activeStudents, vipEliteStudents] = await Promise.all([
    prisma.user.count({ where: studentBase }),
    prisma.user.count({ where: { ...studentBase, isActive: true } }),
    prisma.user.count({
      where: {
        ...studentBase,
        tier: { notIn: ["FREE"] },
      },
    }),
  ]);

  const recentStudentActivity =
    coachOnly && studentIdsForActivity && studentIdsForActivity.length === 0
      ? []
      : await prisma.activityLog.findMany({
          where: {
            action: { startsWith: "student." },
            ...(studentIdsForActivity && studentIdsForActivity.length > 0
              ? { userId: { in: studentIdsForActivity } }
              : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 15,
          include: {
            user: {
              select: { name: true, email: true, tier: true },
            },
          },
        });

  return {
    totalStudents,
    activeStudents,
    vipEliteStudents,
    recentStudentActivity,
  };
}

export async function getCoachStudentsOverview() {
  const session = await auth();
  if (
    !session?.user?.id ||
    !canAccessCoach(session.user.role as UserRole | undefined) ||
    session.user.isActive === false
  ) {
    throw new Error("Unauthorized");
  }

  const coachOnly = session.user.role === UserRole.COACH;

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(coachOnly ? { coachId: session.user.id } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      isActive: true,
      createdAt: true,
      enrollments: {
        select: {
          progress: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  return students.map((student) => {
    const avgProgress =
      student.enrollments.length > 0
        ? Math.round(
            student.enrollments.reduce(
              (sum: number, e: { progress: number }) => sum + e.progress,
              0
            ) / student.enrollments.length
          )
        : 0;

    const latestCourse =
      student.enrollments.length > 0
        ? student.enrollments[0].course.title
        : null;

    return {
      ...student,
      avgProgress,
      coursesCount: student.enrollments.length,
      latestCourse,
    };
  });
}

export type CoachingTeamMember = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  assignedStudents: number;
};

export async function getCoachingTeamOverview(): Promise<CoachingTeamMember[]> {
  const session = await auth();
  if (
    !session?.user?.id ||
    session.user.role !== UserRole.ADMIN ||
    session.user.isActive === false
  ) {
    return [];
  }

  const coaches = await prisma.user.findMany({
    where: { role: UserRole.COACH },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      _count: {
        select: { students: true },
      },
    },
  });

  return coaches.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    isActive: c.isActive,
    assignedStudents: c._count.students,
  }));
}

export async function getCourseCatalogStats() {
  const session = await auth();
  if (!session?.user?.id || session.user.isActive === false) {
    throw new Error("Unauthorized");
  }

  const [courseCount, moduleCount, lessonCount] = await Promise.all([
    prisma.course.count(),
    prisma.module.count(),
    prisma.lesson.count(),
  ]);

  return { courseCount, moduleCount, lessonCount };
}
