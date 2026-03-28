import { auth } from "@/auth";
import {
  createCourseAction,
  createLessonAction,
  createModuleAction,
  deleteCourseAction,
  getCoursesForAdmin,
  updateCourseAction,
  updateLessonAction,
} from "@/app/actions/admin";
import EliteCard from "@/components/ui/EliteCard";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN" || session.user.isActive === false) {
    redirect("/dashboard");
  }

  const courses = await getCoursesForAdmin();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-elite text-3xl font-bold gold-text-gradient uppercase">
            Gestion des Formations
          </h1>
          <p className="text-snow/40 text-sm mt-2">Creation, edition et ressources pedagogiques.</p>
        </div>
        <Link href="/dashboard/admin" className="text-gold text-sm font-bold hover:underline">
          Retour Admin
        </Link>
      </header>

      <EliteCard>
        <h2 className="text-sm font-bold text-snow mb-4 uppercase tracking-widest">Nouvelle formation</h2>
        <form action={createCourseAction} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            name="title"
            required
            placeholder="Titre"
            className="bg-elite-black border border-white/10 rounded px-3 py-2 text-sm text-snow"
          />
          <input
            name="description"
            placeholder="Description"
            className="bg-elite-black border border-white/10 rounded px-3 py-2 text-sm text-snow"
          />
          <select
            name="minTier"
            className="bg-elite-black border border-white/10 rounded px-3 py-2 text-sm text-snow"
            defaultValue="FREE"
          >
            <option value="FREE">FREE</option>
            <option value="INDIVIDUEL">INDIVIDUEL</option>
            <option value="COLLECTIF">COLLECTIF</option>
            <option value="PRIVE">PRIVÉ</option>
          </select>
          <button className="bg-gold/10 text-gold text-sm font-bold rounded px-4 py-2">Creer</button>
        </form>
      </EliteCard>

      <div className="space-y-6">
        {courses.map((course) => (
          <EliteCard key={course.id} className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <form action={updateCourseAction} className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                <input type="hidden" name="courseId" value={course.id} />
                <input
                  name="title"
                  defaultValue={course.title}
                  className="bg-elite-black border border-white/10 rounded px-3 py-2 text-sm text-snow"
                />
                <input
                  name="description"
                  defaultValue={course.description ?? ""}
                  className="bg-elite-black border border-white/10 rounded px-3 py-2 text-sm text-snow"
                />
                <select
                  name="minTier"
                  defaultValue={course.minTier}
                  className="bg-elite-black border border-white/10 rounded px-3 py-2 text-sm text-snow"
                >
                  <option value="FREE">FREE</option>
                  <option value="INDIVIDUEL">INDIVIDUEL</option>
                  <option value="COLLECTIF">COLLECTIF</option>
                  <option value="PRIVE">PRIVÉ</option>
                </select>
                <button className="bg-white/5 border border-white/10 text-snow text-sm font-bold rounded px-4 py-2">
                  Sauvegarder
                </button>
              </form>
              <form action={deleteCourseAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <button className="bg-red-500/10 text-red-400 text-sm font-bold rounded px-4 py-2">
                  Supprimer
                </button>
              </form>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-4">
              <form action={createModuleAction} className="flex items-center gap-3">
                <input type="hidden" name="courseId" value={course.id} />
                <input
                  name="title"
                  required
                  placeholder="Ajouter un module"
                  className="flex-1 bg-elite-black border border-white/10 rounded px-3 py-2 text-sm text-snow"
                />
                <button className="bg-gold/10 text-gold text-xs font-bold rounded px-4 py-2">
                  Ajouter module
                </button>
              </form>

              {course.modules.map((module) => (
                <div key={module.id} className="border border-white/10 rounded-lg p-4 space-y-4">
                  <p className="text-sm font-bold text-snow">
                    Module {module.order}: {module.title}
                  </p>

                  <form action={createLessonAction} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input type="hidden" name="moduleId" value={module.id} />
                    <input
                      name="title"
                      required
                      placeholder="Titre lecon"
                      className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                    />
                    <input
                      name="videoUrl"
                      placeholder="URL video"
                      className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                    />
                    <input
                      name="resourceUrl"
                      placeholder="URL PDF / ressource"
                      className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                    />
                    <input
                      name="content"
                      placeholder="Resume"
                      className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                    />
                    <button className="bg-gold/10 text-gold text-xs font-bold rounded px-3 py-2">
                      Ajouter lecon
                    </button>
                  </form>

                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <form key={lesson.id} action={updateLessonAction} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input
                          name="title"
                          defaultValue={lesson.title}
                          className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                        />
                        <input
                          name="videoUrl"
                          defaultValue={lesson.videoUrl ?? ""}
                          placeholder="URL video"
                          className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                        />
                        <input
                          name="resourceUrl"
                          defaultValue={lesson.resourceUrl ?? ""}
                          placeholder="URL PDF / ressource"
                          className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                        />
                        <input
                          name="content"
                          defaultValue={lesson.content ?? ""}
                          placeholder="Resume"
                          className="bg-elite-black border border-white/10 rounded px-3 py-2 text-xs text-snow"
                        />
                        <button className="bg-white/5 border border-white/10 text-snow text-xs font-bold rounded px-3 py-2">
                          Mettre a jour
                        </button>
                      </form>
                    ))}
                    {module.lessons.length === 0 && (
                      <p className="text-xs text-snow/40">Aucune lecon dans ce module.</p>
                    )}
                  </div>
                </div>
              ))}
              {course.modules.length === 0 && (
                <p className="text-xs text-snow/40">Aucun module pour cette formation.</p>
              )}
            </div>
          </EliteCard>
        ))}
      </div>
    </div>
  );
}
