import React from 'react';
import { getCourseWithContent } from '@/app/actions/lms';
import CourseSidebar from '@/components/lms/CourseSidebar';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.isActive === false) redirect('/auth/login');

  const { id } = await params;
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
  
  if (!course) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-elite-black font-sans">
      <CourseSidebar course={course} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
