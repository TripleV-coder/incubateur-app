import EliteCard from '@/components/ui/EliteCard';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-24 px-4 max-w-4xl mx-auto">
      <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-8">Politique de Confidentialité</h1>
      <EliteCard className="prose prose-invert max-w-none text-snow/80">
        <p className="mb-4 italic">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="text-electric-blue mb-8">
          [Ce document est un modèle RGPD à compléter avec les informations légales de votre entreprise.]
        </p>
        <h2 className="text-xl font-bold text-snow mt-8 mb-4">1. Collecte des données</h2>
        <p className="mb-4">Nous collectons les données suivantes lors de votre inscription : Nom, Email, informations de facturation.</p>
        
        <h2 className="text-xl font-bold text-snow mt-8 mb-4">2. Utilisation des données</h2>
        <p className="mb-4">Vos données sont exclusivement utilisées pour la gestion de votre accès à la plateforme et la facturation.</p>

        <h2 className="text-xl font-bold text-snow mt-8 mb-4">3. Sécurité</h2>
        <p className="mb-4">Vos mots de passe sont hachés cryptographiquement. Aucune coordonnée bancaire n'est stockée sur nos serveurs de base de données.</p>
      </EliteCard>
    </main>
  );
}
