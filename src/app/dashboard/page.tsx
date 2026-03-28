import React from 'react';
import { auth } from '@/auth';
import {
  getPublishedAnnouncements,
  getStudentNotifications,
  getStudentPayments,
  getStudentStats,
  markNotificationAsReadAction,
} from '@/app/actions/dashboard';
import StatCard from '@/components/dashboard/StatCard';
import EliteCard from '@/components/ui/EliteCard';
import { BookOpen, CheckCircle, Flame, Trophy } from 'lucide-react';
import Link from 'next/link';
import { formatXof } from '@/lib/currency';
import { redirect } from 'next/navigation';
import { canAccessAdmin, canAccessCoach } from '@/lib/rbac';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.isActive === false) redirect('/auth/login');
  if (canAccessAdmin(session.user.role)) redirect("/dashboard/admin");
  if (canAccessCoach(session.user.role)) redirect("/dashboard/coach");

  const stats = await getStudentStats();
  const payments = await getStudentPayments();
  const announcements = await getPublishedAnnouncements();
  const notifications = await getStudentNotifications();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-2">
          BIENVENUE DANS VOTRE ESPACE ÉLITE
        </h1>
        <p className="text-snow/40 font-medium">Continuez votre ascension vers le succès (MVP 1.0)</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard 
          label="Formations" 
          value={stats.coursesCount} 
          icon={<BookOpen className="w-6 h-6" />} 
        />
        <StatCard 
          label="Leçons Terminées" 
          value={stats.completedLessons} 
          icon={<CheckCircle className="w-6 h-6" />} 
        />
        <StatCard 
          label="Progression Moyenne" 
          value={`${stats.avgProgress}%`} 
          icon={<Trophy className="w-6 h-6" />} 
        />
        <StatCard 
          label="Elite Streak" 
          value="-- d" 
          icon={<Flame className="w-6 h-6" />} 
          trend="Bientôt"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-snow">Vos Formations Actuelles</h2>
            <Link href="/courses" className="text-gold text-sm font-bold hover:underline">Voir tout</Link>
          </div>

          <div className="grid gap-4">
            {stats.recentEnrollments.map((enr) => (
              <EliteCard key={enr.id} className="relative group overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <BookOpen />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-snow mb-1 text-lg group-hover:text-gold transition-colors">{enr.course.title}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold transition-all" 
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-snow/40">{enr.progress}%</span>
                    </div>
                  </div>
                  <Link 
                    href={`/courses/${enr.courseId}`}
                    className="bg-gold/10 hover:bg-gold text-gold hover:text-elite-black px-6 py-2 rounded-lg font-bold transition-all text-sm"
                  >
                    Reprendre
                  </Link>
                </div>
              </EliteCard>
            ))}
            
            {stats.recentEnrollments.length === 0 && (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-snow/40 italic">Vous n'avez pas encore de formation active.</p>
                <Link href="/courses" className="text-gold mt-4 block font-bold">Découvrir le catalogue</Link>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-snow">Historique des Paiements</h2>
            <EliteCard className="p-0 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Montant (XOF)</th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Fournisseur</th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 text-xs text-snow/60">
                        {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 font-bold text-snow">
                        {formatXof(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-xs text-snow/60">{payment.provider}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            payment.status === "SUCCESS"
                              ? "bg-green-400/10 text-green-400"
                              : payment.status === "FAILED"
                                ? "bg-red-400/10 text-red-400"
                                : "bg-yellow-400/10 text-yellow-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-snow/40 text-sm">
                        Aucun paiement pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </EliteCard>
          </div>
        </div>

        {/* Sidebar Widgets (Elite Community etc) */}
        <div className="space-y-6">
          <EliteCard>
            <h3 className="font-bold text-snow mb-4">Notifications</h3>
            <div className="space-y-4">
              {notifications.map((notification) => {
                const isRead = notification.reads.length > 0;
                return (
                  <div key={notification.id} className="pb-4 border-b border-white/5 last:border-b-0 last:pb-0">
                    <p className="text-sm font-bold text-snow">{notification.title}</p>
                    <p className="text-xs text-snow/60 mt-1 leading-relaxed">{notification.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-snow/40 uppercase tracking-widest">
                        {new Date(notification.createdAt).toLocaleDateString("fr-FR")} -{" "}
                        {notification.createdBy?.name || "Administration"}
                      </p>
                      {isRead ? (
                        <span className="text-[10px] text-green-400 font-bold">LU</span>
                      ) : (
                        <form action={markNotificationAsReadAction}>
                          <input type="hidden" name="notificationId" value={notification.id} />
                          <button className="text-[10px] text-gold hover:underline font-bold">
                            Marquer lu
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <p className="text-xs text-snow/40">Aucune notification.</p>
              )}
            </div>
          </EliteCard>

          <EliteCard>
            <h3 className="font-bold text-snow mb-4">Annonces</h3>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="pb-4 border-b border-white/5 last:border-b-0 last:pb-0">
                  <p className="text-sm font-bold text-snow">{announcement.title}</p>
                  <p className="text-xs text-snow/60 mt-1 leading-relaxed">{announcement.content}</p>
                  <p className="text-[10px] text-snow/40 mt-2 uppercase tracking-widest">
                    {new Date(announcement.createdAt).toLocaleDateString("fr-FR")} -{" "}
                    {announcement.createdBy?.name || "Administration"}
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-xs text-snow/40">Aucune annonce publiee pour le moment.</p>
              )}
            </div>
          </EliteCard>

          <EliteCard className="border-gold/30 bg-gold/5">
            <h3 className="font-elite text-lg font-bold gold-text-gradient mb-4 uppercase">Communauté Élite</h3>
            <p className="text-sm text-snow/60 mb-6 leading-relaxed">
              Ne restez pas seul. Rejoignez les autres entrepreneurs et partagez vos victoires sur Telegram.
            </p>
            <a 
              href="https://t.me/incubateurelite" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full gold-gradient text-elite-black font-bold py-3 rounded-xl text-sm block text-center"
            >
              Rejoindre le Groupe
            </a>
          </EliteCard>

          <EliteCard>
            <h3 className="font-bold text-snow mb-4">Support Coaching</h3>
            <p className="text-xs text-snow/40 mb-6 leading-relaxed">
              Une question ? Un blocage ? Nos coachs experts sont là pour vous débloquer en moins de 24h.
            </p>
            <a 
              href="mailto:support@incubateurelite.com"
              className="w-full border border-white/10 hover:bg-white/5 text-snow text-sm py-3 rounded-xl transition-all block text-center"
            >
              Ouvrir un Ticket
            </a>
          </EliteCard>
        </div>
      </div>
    </div>
  );
}
