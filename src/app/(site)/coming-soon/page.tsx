import Link from 'next/link';
import EliteCard from '@/components/ui/EliteCard';
import { Sparkles } from 'lucide-react';

export default function ComingSoon() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
       <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
       
       <div className="w-full max-w-2xl text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/10 text-electric-blue text-xs font-bold uppercase tracking-widest mb-8 border border-electric-blue/20">
           <Sparkles className="w-4 h-4" /> En développement
         </div>

         <h1 className="font-elite text-5xl md:text-7xl mb-6 font-bold tracking-tight">
           <span className="block text-snow">PROCHAINEMENT</span>
         </h1>
         
         <p className="font-sans text-xl text-snow/60 mb-10">
           Nous construisons actuellement cette section pour vous offrir une expérience toujours plus premium et performante.
         </p>

         <EliteCard className="mb-10 text-left">
           <h3 className="text-lg font-bold text-snow mb-2">Restez informé</h3>
           <p className="text-snow/50 text-sm mb-6">Abonnez-vous pour être notifié de l'ouverture de ce module exclusif.</p>
           
           <form className="flex gap-2">
             <input 
               type="email" 
               placeholder="votre@email.com" 
               className="flex-1 bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-electric-blue/50 transition-colors text-snow"
             />
             <button type="button" className="bg-electric-blue hover:bg-electric-blue/90 text-white font-bold px-6 py-3 rounded-lg transition-colors">
               M'avertir
             </button>
           </form>
         </EliteCard>

         <Link 
           href="/"
           className="text-snow/40 hover:text-white transition-colors underline font-medium text-sm"
         >
           Retourner au QG
         </Link>
       </div>
    </main>
  );
}
