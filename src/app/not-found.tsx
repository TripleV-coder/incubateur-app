import Link from 'next/link';
import EliteCard from '@/components/ui/EliteCard';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_50%)]" />
      <div className="w-full max-w-lg text-center">
        <EliteCard>
          <h1 className="font-elite text-6xl md:text-8xl font-bold gold-text-gradient mb-4">404</h1>
          <h2 className="text-2xl font-bold text-snow mb-4">Page Introuvable</h2>
          <p className="text-snow/60 mb-8">
            Il semble que vous vous soyez égaré. Cette partie de l'empire n'existe pas encore.
          </p>
          <Link 
            href="/"
            className="inline-block gold-gradient text-elite-black font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform"
          >
            Retourner à l'Accueil
          </Link>
        </EliteCard>
      </div>
    </main>
  );
}
