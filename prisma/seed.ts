import {
  LeadStatus,
  PrismaClient,
  Tier,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.notificationRead.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();
  const hashedPassword = await bcrypt.hash("password123", 10);

  const [admin, coach, studentFree, studentIndiv, studentCollectif, studentSuspended] =
    await Promise.all([
      prisma.user.create({
        data: {
          email: "admin@incubateurelite.com",
          name: "Admin Elite",
          password: hashedPassword,
          role: UserRole.ADMIN,
          tier: Tier.PRIVE,
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          email: "coach@incubateurelite.com",
          name: "Coach Elite",
          password: hashedPassword,
          role: UserRole.COACH,
          tier: Tier.PRIVE,
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          email: "student.free@incubateurelite.com",
          name: "Etudiant Free",
          password: hashedPassword,
          role: UserRole.STUDENT,
          tier: Tier.FREE,
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          email: "student.individuel@incubateurelite.com",
          name: "Etudiant Individuel",
          password: hashedPassword,
          role: UserRole.STUDENT,
          tier: Tier.INDIVIDUEL,
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          email: "student.collectif@incubateurelite.com",
          name: "Etudiant Collectif",
          password: hashedPassword,
          role: UserRole.STUDENT,
          tier: Tier.COLLECTIF,
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          email: "student.suspended@incubateurelite.com",
          name: "Etudiant Suspendu",
          password: hashedPassword,
          role: UserRole.STUDENT,
          tier: Tier.INDIVIDUEL,
          isActive: false,
        },
      }),
    ]);

  await prisma.user.update({
    where: { id: studentIndiv.id },
    data: { coachId: coach.id },
  });

  const [courseFree, courseIndiv, courseCollectif] = await Promise.all([
    prisma.course.create({
      data: {
        id: "course-free-foundations",
        title: "Foundations E-commerce",
        description: "Les bases du marketing digital et de la vente de produits digitaux.",
        minTier: Tier.FREE,
      },
    }),
    prisma.course.create({
      data: {
        id: "course-individuel-empire",
        title: "E-com Empire: Pack Individuel",
        description: "3 eBooks + video d'explication detaillee pour demarrer.",
        minTier: Tier.INDIVIDUEL,
      },
    }),
    prisma.course.create({
      data: {
        id: "course-collectif-coaching",
        title: "Coaching Collectif: De 0 a 1M",
        description: "4 semaines de coaching collectif + videos pratiques.",
        minTier: Tier.COLLECTIF,
      },
    }),
  ]);

  const freeModule = await prisma.module.create({
    data: {
      title: "Bases & Positionnement",
      order: 1,
      courseId: courseFree.id,
    },
  });
  const vipModule1 = await prisma.module.create({
    data: {
      title: "Mindset & Systeme",
      order: 1,
      courseId: courseIndiv.id,
    },
  });
  const vipModule2 = await prisma.module.create({
    data: {
      title: "Acquisition & Conversion",
      order: 2,
      courseId: courseIndiv.id,
    },
  });
  const eliteModule = await prisma.module.create({
    data: {
      title: "Scale & Team Management",
      order: 1,
      courseId: courseCollectif.id,
    },
  });

  const [
    freeLesson1,
    freeLesson2,
    vipLesson1,
    vipLesson2,
    vipLesson3,
    eliteLesson1,
  ] = await Promise.all([
    prisma.lesson.create({
      data: {
        title: "Choisir une niche rentable",
        content: "Framework simple pour identifier une niche avec demande et marge.",
        order: 1,
        moduleId: freeModule.id,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        resourceUrl: "https://example.com/resources/niche-rentable.pdf",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Positionnement premium",
        content: "Comment se differencier avec une offre claire et haut de gamme.",
        order: 2,
        moduleId: freeModule.id,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Bienvenue dans l'incubateur VIP",
        content: "On pose les fondations de votre execution quotidienne.",
        order: 1,
        moduleId: vipModule1.id,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Pipeline de vente scalable",
        content: "Mise en place d'un tunnel conversion-ready.",
        order: 2,
        moduleId: vipModule1.id,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        resourceUrl: "https://example.com/resources/pipeline-scalable.pdf",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Publicites creatives qui convertissent",
        content: "Angles, hooks et offres irresistibles pour Meta/TikTok.",
        order: 1,
        moduleId: vipModule2.id,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Automatisation operationnelle",
        content: "Standardiser process et delegation pour scaler proprement.",
        order: 1,
        moduleId: eliteModule.id,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    }),
  ]);

  await Promise.all([
    prisma.enrollment.create({
      data: {
        userId: studentFree.id,
        courseId: courseFree.id,
        progress: 50,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: studentIndiv.id,
        courseId: courseIndiv.id,
        progress: 66,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: studentCollectif.id,
        courseId: courseIndiv.id,
        progress: 100,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: studentCollectif.id,
        courseId: courseCollectif.id,
        progress: 20,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: admin.id,
        courseId: courseIndiv.id,
        progress: 100,
      },
    }),
  ]);

  await Promise.all([
    prisma.progress.create({
      data: { userId: studentFree.id, lessonId: freeLesson1.id, completed: true },
    }),
    prisma.progress.create({
      data: { userId: studentIndiv.id, lessonId: vipLesson1.id, completed: true },
    }),
    prisma.progress.create({
      data: { userId: studentIndiv.id, lessonId: vipLesson2.id, completed: true },
    }),
    prisma.progress.create({
      data: { userId: studentCollectif.id, lessonId: vipLesson1.id, completed: true },
    }),
    prisma.progress.create({
      data: { userId: studentCollectif.id, lessonId: vipLesson2.id, completed: true },
    }),
    prisma.progress.create({
      data: { userId: studentCollectif.id, lessonId: vipLesson3.id, completed: true },
    }),
    prisma.progress.create({
      data: { userId: studentCollectif.id, lessonId: eliteLesson1.id, completed: true },
    }),
  ]);

  await Promise.all([
    prisma.payment.create({
      data: {
        userId: studentIndiv.id,
        amount: 12_700,
        currency: "XOF",
        status: "SUCCESS",
        provider: "STRIPE",
        reference: "seed_stripe_success_001",
      },
    }),
    prisma.payment.create({
      data: {
        userId: studentCollectif.id,
        amount: 25_500,
        currency: "XOF",
        status: "SUCCESS",
        provider: "STRIPE",
        reference: "seed_stripe_success_002",
      },
    }),
    prisma.payment.create({
      data: {
        userId: studentFree.id,
        amount: 12_700,
        currency: "XOF",
        status: "PENDING",
        provider: "CINETPAY",
        reference: "seed_cinetpay_pending_001",
      },
    }),
    prisma.payment.create({
      data: {
        userId: studentSuspended.id,
        amount: 12_700,
        currency: "XOF",
        status: "FAILED",
        provider: "STRIPE",
        reference: "seed_stripe_failed_001",
      },
    }),
  ]);

  await Promise.all([
    prisma.announcement.create({
      data: {
        title: "Masterclass live mardi 20h",
        content: "Session Zoom sur la creation d'offres irresistibles. Presence recommandee.",
        isPublished: true,
        createdById: admin.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Maintenance plateforme",
        content: "Une maintenance courte est prevue dimanche de 02h a 03h.",
        isPublished: false,
        createdById: admin.id,
      },
    }),
  ]);

  const [notifAll, notifVip, notifElite] = await Promise.all([
    prisma.notification.create({
      data: {
        title: "Bienvenue sur la plateforme",
        content: "Completez votre profil et commencez par votre premiere lecon.",
        targetTier: null,
        isPublished: true,
        createdById: coach.id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Nouvelle ressource VIP",
        content: "Le template tunnel conversion est disponible dans le module 2.",
        targetTier: Tier.INDIVIDUEL,
        isPublished: true,
        createdById: admin.id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Session Elite privee",
        content: "Live strategie d'acquisition avancee samedi a 18h.",
        targetTier: Tier.PRIVE,
        isPublished: true,
        createdById: admin.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.notificationRead.create({
      data: {
        userId: studentIndiv.id,
        notificationId: notifAll.id,
      },
    }),
    prisma.notificationRead.create({
      data: {
        userId: studentCollectif.id,
        notificationId: notifAll.id,
      },
    }),
    prisma.notificationRead.create({
      data: {
        userId: studentCollectif.id,
        notificationId: notifVip.id,
      },
    }),
    prisma.notificationRead.create({
      data: {
        userId: admin.id,
        notificationId: notifElite.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.lead.create({
      data: {
        email: "lead.new@example.com",
        name: "Lead Nouveau",
        source: "landing",
        status: LeadStatus.NEW,
      },
    }),
    prisma.lead.create({
      data: {
        email: "lead.contacted@example.com",
        name: "Lead Contacte",
        source: "instagram",
        status: LeadStatus.CONTACTED,
      },
    }),
    prisma.lead.create({
      data: {
        email: "lead.converted@example.com",
        name: "Lead Converti",
        source: "webinar",
        status: LeadStatus.CONVERTED,
      },
    }),
  ]);

  await Promise.all([
    prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "seed.system.ready",
        target: "application",
        metadata: JSON.stringify({ version: "mvp" }),
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: studentIndiv.id,
        action: "student.lesson.complete",
        target: freeLesson2.id,
      },
    }),
  ]);

  console.log("Seed completed successfully.");
  console.log("Comptes de test (mot de passe commun): password123");
  console.log("- admin@incubateurelite.com (ADMIN)");
  console.log("- coach@incubateurelite.com (COACH)");
  console.log("- student.free@incubateurelite.com (STUDENT/FREE)");
  console.log("- student.individuel@incubateurelite.com (STUDENT/INDIVIDUEL)");
  console.log("- student.collectif@incubateurelite.com (STUDENT/COLLECTIF)");
  console.log("- student.suspended@incubateurelite.com (STUDENT suspendu)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
