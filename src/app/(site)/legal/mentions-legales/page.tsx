import EliteCard from '@/components/ui/EliteCard';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen py-24 px-4 max-w-4xl mx-auto">
      <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-8">Mentions Légales</h1>
      <EliteCard className="prose prose-invert max-w-none text-snow/80">
        <h2 className="text-xl font-bold text-snow mt-8 mb-4">Éditeur du site</h2>
        <p className="mb-2"><span className="text-electric-blue">[Nom de votre Entreprise / Auto-entreprise]</span></p>
        <p className="mb-2">Adresse : [Votre Adresse]</p>
        <p className="mb-4">Email : support@incubateurelite.com</p>
        
        <h2 className="text-xl font-bold text-snow mt-8 mb-4">Hébergement</h2>
        <p className="mb-2">Ce site est hébergé par Vercel Inc.</p>
        <p className="mb-4">440 N Barranca Ave #4133 Covina, CA 91723</p>

        <h2 className="text-xl font-bold text-snow mt-8 mb-4">Propriété intellectuelle</h2>
        <p className="mb-4">L'ensemble du contenu de ce site (vidéos, textes, design) est la propriété exclusive de l'Incubateur Elite 4.0. Toute reproduction est interdite sans autorisation préalable.</p>
      </EliteCard>
    </main>
  );
}
