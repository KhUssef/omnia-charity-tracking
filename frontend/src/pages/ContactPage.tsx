import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { OMNIA } from '../data/omnia';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Tous les champs sont requis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.sendContactMessage(form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-sky min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow mb-3">Écrire à l’équipe</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-navy-900 mb-4">Contactez-nous</h1>
          <p className="text-lg text-ink-500 mb-12 max-w-2xl">
            Une question, un souhait de bénévolat, ou un partenariat ? Écrivez-nous et nous vous répondrons dans les plus brefs délais.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold text-stone-900 mb-2">Message envoyé !</h3>
                <p className="text-stone-600">Merci pour votre message. Nous vous répondrons rapidement.</p>
                <button onClick={() => setSent(false)} className="mt-6 text-brand-600 hover:text-brand-700 font-medium underline">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Nom complet</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition" placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Message</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition resize-none" placeholder="Votre message..." />
                </div>
                {error && <p className="text-rose-600 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-gold disabled:opacity-50 font-semibold py-3.5 rounded-full flex items-center justify-center gap-2">
                  {loading ? <span>Envoi en cours...</span> : <><Send className="w-5 h-5" /><span>Envoyer le message</span></>}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="space-y-8">
            <div className="surface-card rounded-3xl p-6 space-y-5">
              <h3 className="text-xl font-display font-bold text-ink-900">Nos coordonnées</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <div><p className="font-medium text-ink-900">Adresse</p><p className="text-ink-500">{OMNIA.address}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <div><p className="font-medium text-ink-900">Téléphone</p><p className="text-ink-500">{OMNIA.phone}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <div><p className="font-medium text-ink-900">Email</p><p className="text-ink-500">{OMNIA.email}</p></div>
                </div>
              </div>
            </div>
            <div id="don" className="rounded-3xl section-navy p-6 scroll-mt-24">
              <h3 className="text-xl font-bold text-on-navy mb-2">Faire un don</h3>
              <p className="text-sm text-on-navy-muted">Écrivez-nous ou appelez le {OMNIA.phone}. Chaque don est enregistré et tracé.</p>
            </div>
            <div id="rejoindre" className="rounded-3xl bg-gold-400 p-6 scroll-mt-24">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Nous rejoindre</h3>
              <p className="text-sm text-navy-800/80">Bénévoles bienvenus. Mentionnez « rejoindre » dans votre message.</p>
            </div>
            <div className="surface-card rounded-3xl p-6">
              <h3 className="text-xl font-bold text-ink-900 mb-4">Horaires d'ouverture</h3>
              <div className="space-y-2 text-stone-600">
                <div className="flex justify-between"><span>Lundi - Vendredi</span><span className="font-medium text-stone-900">9h00 - 18h00</span></div>
                <div className="flex justify-between"><span>Samedi</span><span className="font-medium text-stone-900">9h00 - 13h00</span></div>
                <div className="flex justify-between"><span>Dimanche</span><span className="font-medium text-stone-900">Fermé</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
