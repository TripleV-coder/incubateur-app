import React from 'react';
import { getAdminStats } from '@/app/actions/dashboard';
import {
  createAnnouncementAction,
  createNotificationAction,
  getCoachesForAdmin,
  getCourseAccessControlForAdmin,
  getAnnouncementsForAdmin,
  grantCourseAccessAction,
  getLeadsForAdmin,
  getNotificationsForAdmin,
  getRecentActivityLogs,
  getUsersForAdmin,
  revokeCourseAccessAction,
  toggleNotificationPublishAction,
  toggleAnnouncementPublishAction,
  updateLeadStatusAction,
} from '@/app/actions/admin';
import { AdminUsersPanel } from '@/components/dashboard/AdminUsersPanel';
import StatCard from '@/components/dashboard/StatCard';
import EliteCard from '@/components/ui/EliteCard';
import { Users, Wallet, Activity } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatXof } from '@/lib/currency';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN" || session.user.isActive === false) {
    redirect("/dashboard");
  }
  const adminId = session.user.id;
  if (!adminId) {
    redirect("/dashboard");
  }

  const stats = await getAdminStats();
  const [users, coaches] = await Promise.all([getUsersForAdmin(), getCoachesForAdmin()]);
  const announcements = await getAnnouncementsForAdmin();
  const courseAccess = await getCourseAccessControlForAdmin();
  const leads = await getLeadsForAdmin();
  const notifications = await getNotificationsForAdmin();
  const activityLogs = await getRecentActivityLogs();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-2 uppercase tracking-tight">
          Panneau d'Administration
        </h1>
        <p className="text-snow/40 font-medium font-sans uppercase text-xs tracking-widest">
          Utilisateurs, accès formations, attribution coach — tout se pilote ici.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/dashboard/admin/courses" className="text-gold text-sm font-bold hover:underline uppercase tracking-widest">
            Gérer les formations (LMS)
          </Link>
          <Link href="/courses" className="text-snow/50 text-sm font-semibold hover:text-gold uppercase tracking-widest">
            Catalogue public
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          label="Élèves Totaux" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6" />} 
        />
        <StatCard 
          label="Revenu total (XOF)" 
          value={formatXof(stats.totalRevenue)} 
          icon={<Wallet className="w-6 h-6" />} 
        />
        <StatCard 
          label="Paiements Réussis" 
          value={stats.recentPayments.filter((p) => p.status === "SUCCESS").length} 
          icon={<Activity className="w-6 h-6" />} 
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-snow">Paiements Récents</h2>
          <span className="text-xs text-snow/40 uppercase tracking-widest">{stats.recentPayments.length} derniers</span>
        </div>

        <EliteCard className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Montant (XOF)</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Fournisseur</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-snow group-hover:text-gold transition-colors">{p.user.name}</div>
                    <div className="text-xs text-snow/40">{p.user.email}</div>
                  </td>
                  <td className="px-6 py-4 font-elite text-lg text-snow">{formatXof(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'SUCCESS' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-snow/60">{p.provider}</td>
                  <td className="px-6 py-4 text-xs text-snow/40">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </EliteCard>
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-snow">Gestion des utilisateurs</h2>
            <p className="mt-1 max-w-2xl text-sm text-snow/45">
              Rôle, offre, coach et statut sur une seule ligne d&apos;action — recherche et filtres pour retrouver un compte rapidement.
            </p>
          </div>
        </div>

        <EliteCard className="p-6 md:p-8">
          <AdminUsersPanel
            users={users}
            coaches={coaches}
            currentUserId={adminId}
          />
        </EliteCard>
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-snow">Contrôle d&apos;accès aux formations</h2>
          <span className="text-xs text-snow/40 uppercase tracking-widest">
            Piloté par l&apos;admin
          </span>
        </div>
        <EliteCard className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Élève</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Accès actuels</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Accorder / Révoquer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {courseAccess.students.map((student) => {
                const currentAccessIds = new Set(student.enrollments.map((entry) => entry.courseId));
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-snow">{student.name || "Sans nom"}</div>
                      <div className="text-xs text-snow/40">
                        {student.email} • {student.tier}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-snow/60">
                      {courseAccess.courses
                        .filter((course) => currentAccessIds.has(course.id))
                        .map((course) => course.title)
                        .join(" • ") || "Aucun accès payant accordé"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <form action={grantCourseAccessAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={student.id} />
                          <select
                            name="courseId"
                            defaultValue={courseAccess.courses[0]?.id}
                            className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                          >
                            {courseAccess.courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                          <button className="text-xs bg-green-500/10 text-green-400 px-3 py-2 rounded">
                            Accorder
                          </button>
                        </form>
                        <form action={revokeCourseAccessAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={student.id} />
                          <select
                            name="courseId"
                            defaultValue={courseAccess.courses[0]?.id}
                            className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                          >
                            {courseAccess.courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                          <button className="text-xs bg-red-500/10 text-red-400 px-3 py-2 rounded">
                            Révoquer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </EliteCard>
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-snow">Leads marketing</h2>
          <span className="text-xs text-snow/40 uppercase tracking-widest">
            {leads.length} leads
          </span>
        </div>
        <EliteCard className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Source</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 text-xs text-snow">
                    <div className="font-bold">{lead.email}</div>
                    {lead.name && <div className="text-snow/40">{lead.name}</div>}
                  </td>
                  <td className="px-6 py-4 text-xs text-snow/60">{lead.source || "landing"}</td>
                  <td className="px-6 py-4 text-xs text-snow/60">
                    {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">
                    <form action={updateLeadStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="leadId" value={lead.id} />
                      <select
                        name="status"
                        defaultValue={lead.status}
                        className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                      </select>
                      <button className="text-xs bg-gold/10 text-gold px-3 py-2 rounded">MAJ</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </EliteCard>
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-snow">Annonces Plateforme</h2>
          <span className="text-xs text-snow/40 uppercase tracking-widest">
            {announcements.length} annonces
          </span>
        </div>

        <EliteCard>
          <h3 className="text-sm font-bold text-snow mb-4 uppercase tracking-widest">
            Nouvelle annonce
          </h3>
          <form action={createAnnouncementAction} className="space-y-4">
            <input
              name="title"
              required
              placeholder="Titre"
              className="w-full bg-elite-black border border-white/10 rounded px-4 py-3 text-sm text-snow"
            />
            <textarea
              name="content"
              required
              rows={4}
              placeholder="Contenu de l'annonce"
              className="w-full bg-elite-black border border-white/10 rounded px-4 py-3 text-sm text-snow"
            />
            <label className="inline-flex items-center gap-2 text-xs text-snow/60">
              <input type="checkbox" name="isPublished" defaultChecked className="accent-gold" />
              Publier immediatement
            </label>
            <div>
              <button className="text-xs bg-gold/10 text-gold px-4 py-2 rounded">
                Publier
              </button>
            </div>
          </form>
        </EliteCard>

        <EliteCard className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Titre</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Auteur</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Publie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {announcements.map((announcement) => (
                <tr key={announcement.id}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-snow">{announcement.title}</div>
                    <div className="text-xs text-snow/60 mt-1 line-clamp-2">{announcement.content}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-snow/60">
                    {announcement.createdBy?.name || announcement.createdBy?.email || "Admin"}
                  </td>
                  <td className="px-6 py-4 text-xs text-snow/60">
                    {new Date(announcement.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">
                    <form action={toggleAnnouncementPublishAction}>
                      <input type="hidden" name="announcementId" value={announcement.id} />
                      <label className="inline-flex items-center gap-2 text-xs text-snow/60">
                        <input
                          type="checkbox"
                          name="isPublished"
                          defaultChecked={announcement.isPublished}
                          className="accent-gold"
                        />
                        Publiee
                      </label>
                      <button className="ml-3 text-xs bg-white/5 text-snow px-3 py-2 rounded border border-white/10">
                        Mettre a jour
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-snow/40 text-sm">
                    Aucune annonce pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </EliteCard>
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-snow">Notifications élèves</h2>
          <span className="text-xs text-snow/40 uppercase tracking-widest">
            {notifications.length} notifications
          </span>
        </div>

        <EliteCard>
          <h3 className="text-sm font-bold text-snow mb-4 uppercase tracking-widest">
            Nouvelle notification
          </h3>
          <form action={createNotificationAction} className="space-y-4">
            <input
              name="title"
              required
              placeholder="Titre"
              className="w-full bg-elite-black border border-white/10 rounded px-4 py-3 text-sm text-snow"
            />
            <textarea
              name="content"
              required
              rows={3}
              placeholder="Message"
              className="w-full bg-elite-black border border-white/10 rounded px-4 py-3 text-sm text-snow"
            />
            <div className="flex items-center gap-4">
              <select
                name="targetTier"
                defaultValue=""
                className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
              >
                <option value="">Tous les tiers</option>
                <option value="FREE">FREE</option>
                <option value="INDIVIDUEL">INDIVIDUEL</option>
                <option value="COLLECTIF">COLLECTIF</option>
                <option value="PRIVE">PRIVÉ</option>
              </select>
              <label className="inline-flex items-center gap-2 text-xs text-snow/60">
                <input type="checkbox" name="isPublished" defaultChecked className="accent-gold" />
                Publier
              </label>
              <button className="text-xs bg-gold/10 text-gold px-4 py-2 rounded">
                Envoyer
              </button>
            </div>
          </form>
        </EliteCard>

        <EliteCard className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Titre</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Tier cible</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Lectures</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Publie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-snow">{notification.title}</div>
                    <div className="text-xs text-snow/60 mt-1 line-clamp-2">{notification.content}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-snow/60">{notification.targetTier || "TOUS"}</td>
                  <td className="px-6 py-4 text-xs text-snow/60">{notification._count.reads}</td>
                  <td className="px-6 py-4">
                    <form action={toggleNotificationPublishAction}>
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <label className="inline-flex items-center gap-2 text-xs text-snow/60">
                        <input
                          type="checkbox"
                          name="isPublished"
                          defaultChecked={notification.isPublished}
                          className="accent-gold"
                        />
                        Active
                      </label>
                      <button className="ml-3 text-xs bg-white/5 text-snow px-3 py-2 rounded border border-white/10">
                        MAJ
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </EliteCard>
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-snow">Activite recente</h2>
          <span className="text-xs text-snow/40 uppercase tracking-widest">
            {activityLogs.length} evenements
          </span>
        </div>
        <EliteCard className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">Cible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activityLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-xs text-snow/60">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-snow">{log.action}</td>
                  <td className="px-6 py-4 text-xs text-snow/60">
                    {log.user?.name || log.user?.email || "Systeme"}
                  </td>
                  <td className="px-6 py-4 text-xs text-snow/40">{log.target || "-"}</td>
                </tr>
              ))}
              {activityLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-snow/40 text-sm">
                    Aucun evenement journalise.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </EliteCard>
      </div>
    </div>
  );
}
