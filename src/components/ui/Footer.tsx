import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-white/5 bg-elite-black pt-20 pb-10">
      <div className="shell grid grid-cols-1 gap-12 md:grid-cols-4 mb-14">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6 group inline-block">
            <span className="font-elite text-2xl font-bold tracking-tighter text-snow transition-colors">
              INCUBATEUR <span className="gold-text-gradient">ELITE</span>
            </span>
          </Link>
          <p className="text-snow/60 text-sm leading-relaxed max-w-sm mb-4">
            Le e-commerce des produits digitaux. Plus de 23 000 personnes accompagnées avec 96% de réussite et des résultats palpables.
          </p>
          <div className="space-y-2 mb-6">
            <p className="text-snow/50 text-sm">
              <span className="text-snow/70 font-medium">Tél :</span>{" "}
              <a href="tel:+2290195346920" className="hover:text-gold transition-colors">+229 01 95 34 69 20</a>
            </p>
            <p className="text-snow/50 text-sm">
              <span className="text-snow/70 font-medium">WhatsApp :</span>{" "}
              <a href="https://wa.me/22901616943" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">+229 01 61 69 438</a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-gold/20 hover:text-gold text-snow/60 transition-all">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-gold/20 hover:text-gold text-snow/60 transition-all">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-snow mb-4 tracking-wider uppercase text-sm">Navigation</h3>
          <ul className="space-y-3">
            <li><Link href="/#pricing" className="text-snow/60 hover:text-white transition-colors text-sm">Nos Programmes</Link></li>
            <li><Link href="/courses" className="text-snow/60 hover:text-white transition-colors text-sm">Catalogue Libre</Link></li>
            <li><Link href="/auth/login" className="text-snow/60 hover:text-white transition-colors text-sm">Espace Membre</Link></li>
            <li><Link href="/coming-soon" className="text-snow/60 hover:text-white transition-colors text-sm">Masterclass Gratuite</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-snow mb-4 tracking-wider uppercase text-sm">Légal</h3>
          <ul className="space-y-3">
            <li><Link href="/legal/cgv" className="text-snow/60 hover:text-white transition-colors text-sm">CGV & CGU</Link></li>
            <li><Link href="/legal/privacy" className="text-snow/60 hover:text-white transition-colors text-sm">Politique de Confidentialité</Link></li>
            <li><Link href="/legal/mentions-legales" className="text-snow/60 hover:text-white transition-colors text-sm">Mentions Légales</Link></li>
            <li><a href="https://wa.me/22901616943" target="_blank" rel="noopener noreferrer" className="text-snow/60 hover:text-white transition-colors text-sm">Contact WhatsApp</a></li>
          </ul>
        </div>
      </div>

      <div className="shell border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-snow/40">
        <p>&copy; {new Date().getFullYear()} Incubateur Elite 4.0. Tous droits réservés.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span>Plateforme SaaS Premium</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
