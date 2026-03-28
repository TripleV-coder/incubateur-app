"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';

type SidebarLesson = {
  id: string;
  title: string;
  progress: Array<{ id: string }>;
};

type SidebarModule = {
  id: string;
  title: string;
  order: number;
  lessons: SidebarLesson[];
};

type SidebarCourse = {
  id: string;
  title: string;
  progress?: number;
  modules: SidebarModule[];
};

interface SidebarProps {
  course: SidebarCourse;
}

export const CourseSidebar = ({ course }: SidebarProps) => {
  const pathname = usePathname();
  const currentLessonId = pathname.split("/lessons/")[1] || undefined;
  const allLessons = course.modules.flatMap((module) => module.lessons);
  const unlockedLessonIds = new Set<string>();
  for (let i = 0; i < allLessons.length; i += 1) {
    if (i === 0) {
      unlockedLessonIds.add(allLessons[i].id);
      continue;
    }
    if (allLessons[i - 1].progress?.length > 0) {
      unlockedLessonIds.add(allLessons[i].id);
    } else {
      break;
    }
  }

  return (
    <aside className="w-80 h-full border-r border-white/10 bg-elite-black/40 overflow-y-auto hidden md:block">
      <div className="p-6 border-b border-white/5">
        <h2 className="font-elite text-lg font-bold gold-text-gradient uppercase tracking-wider">
          {course.title}
        </h2>
        <div className="mt-4 bg-white/5 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gold transition-all duration-500" 
            style={{ width: `${course.progress || 0}%` }}
          />
        </div>
        <p className="text-xs text-snow/40 mt-2 font-medium">
          {course.progress || 0}% complété
        </p>
      </div>

      <nav className="p-4">
        {course.modules.map((module) => (
          <div key={module.id} className="mb-6">
            <h3 className="text-xs font-bold text-snow/40 uppercase tracking-widest px-2 mb-3">
              Module {module.order}: {module.title}
            </h3>
            <div className="space-y-1">
              {module.lessons.map((lesson) => {
                const isActive = lesson.id === currentLessonId;
                const isCompleted = lesson.progress?.length > 0;
                const isLocked = !unlockedLessonIds.has(lesson.id);

                if (isLocked) {
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-snow/30 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                      <span className="truncate">{lesson.title}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                      isActive
                        ? 'bg-gold/10 text-gold border border-gold/20'
                        : 'text-snow/60 hover:bg-white/5'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-gold" />
                    ) : isActive ? (
                      <PlayCircle className="w-4 h-4 text-gold animate-pulse" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-snow/20 group-hover:text-snow/40" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default CourseSidebar;
