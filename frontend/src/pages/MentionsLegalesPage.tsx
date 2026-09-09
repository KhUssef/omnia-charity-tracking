import { motion } from 'framer-motion';

export function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-stone-900 mb-4">Mentions Légales</h1>
          <p className="text-stone-600 mb-12">Dernière mise à jour : Septembre 2026</p>
        </motion.div>

        <div className="space-y-10">
          <Section title="1. Éditeur du site" content={[
            { label: 'Association', value: 'Omnia Association' },
            { label: 'Forme juridique', value: 'Association à but non lucratif, régie par le décret-loi n° 2011-88 du 24 septembre 2011' },
            { label: 'Siège social', value: '123 Avenue Habib Bourguiba, 1000 Tunis, Tunisie' },
            { label: 'Téléphone', value: '+216 71 123 456' },
            { label: 'Email', value: 'contact@omnia.org' },
            { label: 'Matricule fiscal', value: '[À compléter]' },
            { label: 'Registre des associations', value: '[À compléter]' },
            { label: 'Directeur de la publication', value: '[Nom du président/directeur]' },
          ]} />

          <Section title="2. Hébergement" content={[
            { label: 'Hébergeur', value: 'Railway Corp.' },
            { label: 'Adresse', value: '811 Montgomery Street, Suite 320, San Francisco, CA 94133, USA' },
            { label: 'Site web', value: 'https://railway.app' },
          ]} />

          <Section title="3. Collecte des données personnelles" content={[
            { label: '', value: 'Conformément à la loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données personnelles, les informations recueillies via ce site font l\'objet d\'un traitement informatique destiné à Omnia Association.' },
            { label: '', value: 'Les données collectées (nom, email, message) sont utilisées uniquement pour répondre aux demandes de contact. Elles ne sont en aucun cas transmises à des tiers.' },
            { label: 'Durée de conservation', value: 'Les données sont conservées pendant une durée de 3 ans à compter du dernier contact.' },
            { label: 'Droits', value: 'Conformément à la législation en vigueur, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous à : privacy@omnia.org' },
          ]} />

          <Section title="4. Cookies" content={[
            { label: '', value: 'Ce site utilise uniquement des cookies techniques nécessaires à son bon fonctionnement (authentification, préférences utilisateur). Aucun cookie publicitaire ou de tracking tiers n\'est déployé.' },
          ]} />

          <Section title="5. Propriété intellectuelle" content={[
            { label: '', value: 'L\'ensemble du contenu de ce site (textes, images, logos, graphiques) est la propriété exclusive d\'Omnia Association, sauf mention contraire. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable.' },
          ]} />

          <Section title="6. Responsabilité" content={[
            { label: '', value: 'Omnia Association s\'efforce d\'assurer l\'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, l\'association ne peut garantir l\'exactitude, la précision ou l\'exhaustivité des informations mises à disposition.' },
            { label: '', value: 'Omnia Association décline toute responsabilité pour tout dommage résultant notamment d\'une imprécision, d\'une inexactitude ou d\'une omission portant sur des informations disponibles sur le site.' },
          ]} />

          <Section title="7. Liens hypertextes" content={[
            { label: '', value: 'Ce site peut contenir des liens vers d\'autres sites internet. Omnia Association n\'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.' },
          ]} />

          <Section title="8. Droit applicable" content={[
            { label: '', value: 'Les présentes mentions légales sont régies par le droit tunisien. En cas de litige, les tribunaux de Tunis seront seuls compétents.' },
          ]} />

          <Section title="9. Contact" content={[
            { label: '', value: 'Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l\'adresse : legal@omnia.org ou par courrier à : Omnia Association, 123 Avenue Habib Bourguiba, 1000 Tunis, Tunisie.' },
          ]} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: { label: string; value: string }[] }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
      <h2 className="text-2xl font-display font-bold text-stone-900 mb-5">{title}</h2>
      <div className="space-y-3 text-stone-700 leading-relaxed">
        {content.map((item, i) => (
          <p key={i}>
            {item.label && <span className="font-semibold text-stone-900">{item.label} : </span>}
            {item.value}
          </p>
        ))}
      </div>
    </motion.section>
  );
}
