import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

export async function getPublicStudentMetrics() {
  noStore();

  const [studentsRegistered, studentsTrained, activeLearners, successfulPayments] =
    await Promise.all([
    prisma.user.count({
      where: {
        role: UserRole.STUDENT,
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        OR: [
          {
            enrollments: {
              some: {},
            },
          },
          {
            payments: {
              some: {
                status: "SUCCESS",
              },
            },
          },
        ],
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        enrollments: {
          some: {},
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: "SUCCESS",
      },
    }),
    ]);

  return { studentsRegistered, studentsTrained, activeLearners, successfulPayments };
}
