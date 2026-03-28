"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import { Tier } from "@prisma/client";

export async function getCourses() {
  return await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseWithContent(courseId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.isActive === false) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: { userId: session.user.id }
              }
            }
          },
        },
      },
    },
  });

  if (!course) return null;

  if (session.user.role === "ADMIN" || session.user.role === "COACH") {
    return course;
  }

  if (course.minTier === Tier.FREE) {
    return course;
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
    select: { id: true },
  });

  if (!enrollment) {
    throw new Error("PaymentRequired");
  }

  return course;
}

export async function updateLessonProgress(lessonId: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id || session.user.isActive === false) throw new Error("Unauthorized");

  const userId = session.user.id;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) throw new Error("Lesson not found");

  if (completed) {
    const orderedLessons = await prisma.lesson.findMany({
      where: { module: { courseId: lesson.module.courseId } },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
      select: { id: true },
    });
    const currentIndex = orderedLessons.findIndex((item) => item.id === lessonId);
    if (currentIndex > 0) {
      const previousLessonId = orderedLessons[currentIndex - 1].id;
      const previousCompleted = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: previousLessonId,
          },
        },
      });
      if (!previousCompleted) {
        throw new Error("Cette lecon est verrouillee. Terminez la precedente d'abord.");
      }
    }
  }

  if (completed) {
    await prisma.progress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: { completed: true },
      create: { userId, lessonId, completed: true }
    });
    await logActivity({
      userId,
      action: "student.lesson.complete",
      target: lessonId,
      metadata: { courseId: lesson.module.courseId },
    });
  } else {
    await prisma.progress.deleteMany({
      where: { userId, lessonId }
    });
    await logActivity({
      userId,
      action: "student.lesson.uncomplete",
      target: lessonId,
      metadata: { courseId: lesson.module.courseId },
    });
  }

  // Update overall course progress in the enrollment table
  // This is a simplified logic for the MVP
  const courseId = lesson.module.courseId;
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId } }
  });
  const completedLessons = await prisma.progress.count({
    where: {
      userId,
      lesson: { module: { courseId } }
    }
  });

  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: { progress: progressPercent },
  });

  revalidatePath("/courses/[id]", "layout");
}
