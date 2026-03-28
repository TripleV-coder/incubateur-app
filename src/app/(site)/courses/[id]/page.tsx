import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Find the first lesson of the first module
  const firstModule = await prisma.module.findFirst({
    where: { courseId: id },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        take: 1
      }
    }
  });

  if (firstModule && firstModule.lessons.length > 0) {
    redirect(`/courses/${id}/lessons/${firstModule.lessons[0].id}`);
  }

  // Fallback if no lessons
  redirect("/dashboard");
}
