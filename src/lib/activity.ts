import { prisma } from "@/lib/prisma";

type LogActivityInput = {
  userId?: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity({
  userId,
  action,
  target,
  metadata,
}: LogActivityInput) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      target,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
