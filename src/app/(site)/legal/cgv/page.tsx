import EliteCard from '@/components/ui/EliteCard';

export default function CGVPage() {
  return (
    <main className="min-h-screen py-24 px-4 max-w-4xl mx-auto">
      <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-8">Conditions Générales de Vente (CGV)</h1>
      <EliteCard className="prose prose-invert max-w-none text-snow/80">
        <p className="mb-4 italic">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="text-electric-blue mb-8">
          [Ce document est un modèle à compléter avec les informations légales de votre entreprise.]
        </p>
        <h2 className="text-xl font-bold text-snow mt-8 mb-4">1. Préambule</h2>
        <p className="mb-4">Les présentes CGV s'appliquent à toutes les ventes conclues par le biais du site Internet Incubateur Elite 4.0.</p>
        
        <h2 className="text-xl font-bold text-snow mt-8 mb-4">2. Accès aux Formations</h2>
        <p className="mb-4">
          L&apos;accès aux formations numériques est immédiat après validation du paiement (montants en{" "}
          <strong className="text-snow">XOF</strong> — franc CFA) via Stripe ou CinetPay.
        </p>

        <h2 className="text-xl font-bold text-snow mt-8 mb-4">3. Politique de Remboursement</h2>
        <p className="mb-4">En conformité avec la réglementation sur les contenus numériques, le droit de rétractation ne peut être exercé une fois le contenu consommé.</p>
      </EliteCard>
    </main>
  );
}
