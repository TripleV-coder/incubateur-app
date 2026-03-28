import React from 'react';
import { getCourseWithContent } from '@/app/actions/lms';
import LessonPlayer from '@/components/lms/LessonPlayer';
import { notFound, redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';

type CourseWithContent = Prisma.CourseGetPayload<{
  include: {
    modules: {
      include: {
        lessons: {
          include: {
            progress: true;
          };
        };
      };
    };
  };
}>;

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  let course = null;
  try {
    course = await getCourseWithContent(id);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "ForbiddenTier" || error.message === "PaymentRequired")
    ) {
      redirect("/#pricing");
    }
    throw error;
  }
  
  if (!course) notFound();

  // Find current lesson and neighbors for navigation
  let currentLesson = null;
  let nextId = undefined;
  let prevId = undefined;

  const allLessons = (course as CourseWithContent).modules.flatMap((m) => m.lessons);
  const unlockedLessonIds = new Set<string>();
  for (let i = 0; i < allLessons.length; i += 1) {
    if (i === 0) {
      unlockedLessonIds.add(allLessons[i].id);
      continue;
    }
    const previousCompleted = allLessons[i - 1].progress.length > 0;
    if (previousCompleted) {
      unlockedLessonIds.add(allLessons[i].id);
    } else {
      break;
    }
  }

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

  if (currentIndex === -1) notFound();
  if (!unlockedLessonIds.has(lessonId)) {
    const fallbackLessonId = allLessons.find((lesson) => unlockedLessonIds.has(lesson.id))?.id;
    redirect(`/courses/${id}/lessons/${fallbackLessonId ?? allLessons[0].id}`);
  }

  currentLesson = allLessons[currentIndex];
  if (currentIndex > 0) prevId = allLessons[currentIndex - 1].id;
  if (
    currentIndex < allLessons.length - 1 &&
    unlockedLessonIds.has(allLessons[currentIndex + 1].id)
  ) {
    nextId = allLessons[currentIndex + 1].id;
  }

  return (
    <LessonPlayer 
      lesson={currentLesson} 
      nextLessonId={nextId}
      prevLessonId={prevId}
      courseId={id}
    />
  );
}
