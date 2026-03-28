import { prisma } from "@/lib/prisma";
import type { Tier } from "@prisma/client";

const tierRank: Record<Tier, number> = {
  FREE: 0,
  INDIVIDUEL: 1,
  COLLECTIF: 2,
  PRIVE: 3,
};

export async function provisionCourseAccessByTier(userId: string, tier: Tier) {
  const eligibleCourses = await prisma.course.findMany({
    where: {
      minTier: {
        in: (Object.keys(tierRank) as Tier[]).filter(
          (courseTier) => tierRank[courseTier] <= tierRank[tier]
        ),
      },
    },
    select: { id: true },
  });

  await Promise.all(
    eligibleCourses.map((course) =>
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId: course.id } },
        update: {},
        create: { userId, courseId: course.id, progress: 0 },
      })
    )
  );
}
