"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { provisionCourseAccessByTier } from "@/lib/course-access";
import { revalidatePath } from "next/cache";
import { Tier, UserRole } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (
    !session?.user?.id ||
    session.user.role !== UserRole.ADMIN ||
    session.user.isActive === false
  ) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getUsersForAdmin() {
  await requireAdmin();

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tier: true,
      isActive: true,
      createdAt: true,
      coachId: true,
      coach: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function getCoachesForAdmin() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: UserRole.COACH, isActive: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: { id: true, name: true, email: true },
  });
}

export async function updateUserAccessAction(formData: FormData) {
  const adminId = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  const tier = String(formData.get("tier") ?? "");
  const isActive = formData.get("isActive") === "on";

  if (!userId) throw new Error("Invalid user");

  const validRole = Object.values(UserRole).find((value) => value === role);
  const validTier = Object.values(Tier).find((value) => value === tier);
  if (!validRole || !validTier) throw new Error("Invalid role or tier");

  // Avoid accidental admin lockout.
  if (adminId === userId && !isActive) {
    throw new Error("Vous ne pouvez pas suspendre votre propre compte admin.");
  }

  let coachIdResolved: string | null = null;
  if (validRole === UserRole.STUDENT) {
    const coachRaw = String(formData.get("coachId") ?? "").trim();
    if (coachRaw) {
      const coachUser = await prisma.user.findUnique({ where: { id: coachRaw } });
      if (
        !coachUser ||
        coachUser.role !== UserRole.COACH ||
        !coachUser.isActive
      ) {
        throw new Error("Coach invalide ou inactif.");
      }
      coachIdResolved = coachUser.id;
    } else {
      coachIdResolved = null;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: validRole,
      tier: validTier,
      isActive,
      coachId: validRole === UserRole.STUDENT ? coachIdResolved : null,
    },
  });

  if (validRole === UserRole.STUDENT && isActive) {
    await provisionCourseAccessByTier(userId, validTier);
  }

  await logActivity({
    userId: adminId,
    action: "admin.user.update_access",
    target: userId,
    metadata: {
      role: validRole,
      tier: validTier,
      isActive,
      coachId: validRole === UserRole.STUDENT ? coachIdResolved : null,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/coach");
}

export async function getCourseAccessControlForAdmin() {
  await requireAdmin();
  const [courses, students] = await Promise.all([
    prisma.course.findMany({
      orderBy: [{ minTier: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        minTier: true,
      },
    }),
    prisma.user.findMany({
      where: { role: UserRole.STUDENT },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        isActive: true,
        enrollments: {
          select: {
            courseId: true,
          },
        },
      },
    }),
  ]);

  return { courses, students };
}

export async function grantCourseAccessAction(formData: FormData) {
  const adminId = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!userId || !courseId) throw new Error("Invalid grant payload");

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId, progress: 0 },
  });

  await logActivity({
    userId: adminId,
    action: "admin.course_access.grant",
    target: `${userId}:${courseId}`,
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/courses");
}

export async function revokeCourseAccessAction(formData: FormData) {
  const adminId = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!userId || !courseId) throw new Error("Invalid revoke payload");

  await prisma.enrollment.deleteMany({
    where: { userId, courseId },
  });

  await logActivity({
    userId: adminId,
    action: "admin.course_access.revoke",
    target: `${userId}:${courseId}`,
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/courses");
}

export async function getAnnouncementsForAdmin() {
  await requireAdmin();
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function createAnnouncementAction(formData: FormData) {
  const adminId = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !content) {
    throw new Error("Title/content required");
  }

  await prisma.announcement.create({
    data: {
      title,
      content,
      isPublished,
      createdById: adminId,
    },
  });

  await logActivity({
    userId: adminId,
    action: "admin.announcement.create",
    metadata: { title, isPublished },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
}

export async function toggleAnnouncementPublishAction(formData: FormData) {
  const adminId = await requireAdmin();
  const announcementId = String(formData.get("announcementId") ?? "");
  const isPublished = formData.get("isPublished") === "on";
  if (!announcementId) throw new Error("Invalid announcement");

  await prisma.announcement.update({
    where: { id: announcementId },
    data: { isPublished },
  });

  await logActivity({
    userId: adminId,
    action: "admin.announcement.toggle_publish",
    target: announcementId,
    metadata: { isPublished },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
}

export async function getCoursesForAdmin() {
  await requireAdmin();
  return prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

export async function createCourseAction(formData: FormData) {
  const adminId = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const minTier = String(formData.get("minTier") ?? "");
  const validTier = Object.values(Tier).find((value) => value === minTier);

  if (!title || !validTier) throw new Error("Invalid course payload");

  const course = await prisma.course.create({
    data: {
      title,
      description: description || null,
      minTier: validTier,
    },
  });

  await logActivity({
    userId: adminId,
    action: "admin.course.create",
    target: course.id,
    metadata: { title, minTier: validTier },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
}

export async function updateCourseAction(formData: FormData) {
  const adminId = await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const minTier = String(formData.get("minTier") ?? "");
  const validTier = Object.values(Tier).find((value) => value === minTier);
  if (!courseId || !title || !validTier) throw new Error("Invalid course payload");

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      description: description || null,
      minTier: validTier,
    },
  });

  await logActivity({
    userId: adminId,
    action: "admin.course.update",
    target: courseId,
    metadata: { title, minTier: validTier },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
}

export async function deleteCourseAction(formData: FormData) {
  const adminId = await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) throw new Error("Invalid course");

  await prisma.$transaction(async (tx) => {
    const modules = await tx.module.findMany({
      where: { courseId },
      select: { id: true },
    });
    const moduleIds = modules.map((item) => item.id);

    if (moduleIds.length > 0) {
      await tx.progress.deleteMany({
        where: { lesson: { moduleId: { in: moduleIds } } },
      });
      await tx.lesson.deleteMany({
        where: { moduleId: { in: moduleIds } },
      });
      await tx.module.deleteMany({
        where: { id: { in: moduleIds } },
      });
    }

    await tx.enrollment.deleteMany({ where: { courseId } });
    await tx.course.delete({ where: { id: courseId } });
  });

  await logActivity({
    userId: adminId,
    action: "admin.course.delete",
    target: courseId,
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
}

export async function createModuleAction(formData: FormData) {
  const adminId = await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!courseId || !title) throw new Error("Invalid module payload");

  const existingCount = await prisma.module.count({ where: { courseId } });
  const createdModule = await prisma.module.create({
    data: {
      courseId,
      title,
      order: existingCount + 1,
    },
  });

  await logActivity({
    userId: adminId,
    action: "admin.module.create",
    target: createdModule.id,
    metadata: { courseId, title },
  });

  revalidatePath("/dashboard/admin/courses");
}

export async function createLessonAction(formData: FormData) {
  const adminId = await requireAdmin();
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const resourceUrl = String(formData.get("resourceUrl") ?? "").trim();
  if (!moduleId || !title) throw new Error("Invalid lesson payload");

  const existingCount = await prisma.lesson.count({ where: { moduleId } });
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      order: existingCount + 1,
      content: content || null,
      videoUrl: videoUrl || null,
      resourceUrl: resourceUrl || null,
    },
  });

  await logActivity({
    userId: adminId,
    action: "admin.lesson.create",
    target: lesson.id,
    metadata: { moduleId, title },
  });

  revalidatePath("/dashboard/admin/courses");
}

export async function updateLessonAction(formData: FormData) {
  const adminId = await requireAdmin();
  const lessonId = String(formData.get("lessonId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const resourceUrl = String(formData.get("resourceUrl") ?? "").trim();
  if (!lessonId || !title) throw new Error("Invalid lesson payload");

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      content: content || null,
      videoUrl: videoUrl || null,
      resourceUrl: resourceUrl || null,
    },
  });

  await logActivity({
    userId: adminId,
    action: "admin.lesson.update",
    target: lessonId,
  });

  revalidatePath("/dashboard/admin/courses");
}

export async function getRecentActivityLogs() {
  await requireAdmin();
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getLeadsForAdmin() {
  await requireAdmin();
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function updateLeadStatusAction(formData: FormData) {
  const adminId = await requireAdmin();
  const leadId = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!leadId || !["NEW", "CONTACTED", "CONVERTED"].includes(status)) {
    throw new Error("Invalid lead payload");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as "NEW" | "CONTACTED" | "CONVERTED" },
  });

  await logActivity({
    userId: adminId,
    action: "admin.lead.update_status",
    target: leadId,
    metadata: { status },
  });

  revalidatePath("/dashboard/admin");
}

export async function getNotificationsForAdmin() {
  await requireAdmin();
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          reads: true,
        },
      },
    },
    take: 40,
  });
}

export async function createNotificationAction(formData: FormData) {
  const adminId = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const targetTier = String(formData.get("targetTier") ?? "");
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !content) throw new Error("Invalid notification payload");

  const normalizedTier =
    targetTier === "FREE" ||
    targetTier === "INDIVIDUEL" ||
    targetTier === "COLLECTIF" ||
    targetTier === "PRIVE"
      ? targetTier
      : null;

  await prisma.notification.create({
    data: {
      title,
      content,
      targetTier: normalizedTier,
      isPublished,
      createdById: adminId,
    },
  });

  await logActivity({
    userId: adminId,
    action: "admin.notification.create",
    metadata: { title, targetTier: normalizedTier, isPublished },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
}

export async function toggleNotificationPublishAction(formData: FormData) {
  const adminId = await requireAdmin();
  const notificationId = String(formData.get("notificationId") ?? "");
  const isPublished = formData.get("isPublished") === "on";
  if (!notificationId) throw new Error("Invalid notification");

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isPublished },
  });

  await logActivity({
    userId: adminId,
    action: "admin.notification.toggle_publish",
    target: notificationId,
    metadata: { isPublished },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
}
