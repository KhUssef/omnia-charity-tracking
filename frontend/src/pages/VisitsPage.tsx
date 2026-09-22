import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Calendar, Clock, User, CheckCircle2, Circle, Target } from 'lucide-react';
import { api } from '../services/api';
import type { VisitPlan, Visit } from '../types';
import { PageHeader } from '../components/PageHeader';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; OpenStreetMap &copy; CARTO';

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function createNumberedIcon(number: number, color: string) {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="omnia-marker" style="background:${color}">${number}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const workerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="omnia-marker omnia-marker--worker"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [plan, setPlan] = useState<VisitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [workerPos, setWorkerPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    api.getVisits()
      .then(setVisits)
      .catch(() => setError('Impossible de charger les visites.'))
      .finally(() => setLoading(false));
    generatePlan();
  }, []);

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setWorkerPos({ lat: latitude, lng: longitude });
            setPlan(await api.getVisitPlan(latitude, longitude));
            setPlanLoading(false);
          },
          async () => {
            setPlan(await api.getVisitPlan());
            setPlanLoading(false);
          },
        );
      } else {
        setPlan(await api.getVisitPlan());
        setPlanLoading(false);
      }
    } catch {
      setPlanLoading(false);
    }
  };

  const mapCenter = useMemo(() => {
    if (workerPos) return [workerPos.lat, workerPos.lng] as [number, number];
    if (plan.length > 0) return [plan[0].latitude, plan[0].longitude] as [number, number];
    return [36.8065, 10.1815] as [number, number];
  }, [workerPos, plan]);

  const markerColors = ['#F5C242', '#FF7A59', '#223A5E', '#E8A93A', '#2A466C', '#1B2A4A'];

  return (
    <div className="section-sky min-h-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <PageHeader
        eyebrow="Planification"
        title="Visites & itinéraires"
        description="Carte stylée et tournée Haversine : les familles les plus vulnérables d’abord, au plus près du terrain."
        actions={
          <button
            onClick={generatePlan}
            disabled={planLoading}
            className="btn-gold disabled:opacity-60"
          >
            <Navigation className="w-4 h-4" />
            {planLoading ? 'Calcul en cours...' : 'Recalculer l’itinéraire'}
          </button>
        }
      />

      {error && <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">{error}</div>}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-[1.8rem] overflow-hidden surface-card">
        <div className="p-4 border-b border-ink-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-ink-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-gold-500" />
            Carte de planification
          </h3>
          {workerPos && (
            <span className="text-xs text-ink-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Votre position
            </span>
          )}
        </div>
        <div className="h-[30rem] w-full">
          <MapContainer center={mapCenter} zoom={7} scrollWheelZoom={false} className="h-full w-full z-0">
            <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
            {workerPos && (
              <>
                <Marker position={[workerPos.lat, workerPos.lng]} icon={workerIcon}>
                  <Popup>Votre position</Popup>
                </Marker>
                <RecenterMap lat={workerPos.lat} lng={workerPos.lng} />
              </>
            )}
            {plan.map((p, i) => (
              <Marker key={p.familyId} position={[p.latitude, p.longitude]} icon={createNumberedIcon(i + 1, markerColors[i % markerColors.length])}>
                <Popup>
                  <div className="space-y-1 min-w-[12rem]">
                    <p className="font-display font-bold text-sm">{i + 1}. {p.familyName}</p>
                    <p className="text-xs text-ink-500">{p.address}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        p.priority > 70 ? 'bg-coral-400/20 text-coral-600' : p.priority > 40 ? 'bg-gold-400/25 text-navy-800' : 'bg-sky-100 text-navy-700'
                      }`}>
                        Priorité {p.priority}
                      </span>
                      {p.distance !== undefined && <span className="font-mono text-[10px] text-ink-500">{p.distance.toFixed(1)} km</span>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {plan.length > 0 && (
          <div className="p-4 border-t border-ink-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plan.slice(0, 6).map((p, i) => (
              <div key={p.familyId} className="flex items-center gap-3 rounded-2xl bg-ink-50 px-3 py-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white" style={{ backgroundColor: markerColors[i % markerColors.length] }}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-800 truncate">{p.familyName}</p>
                  <p className="text-[10px] text-ink-400 truncate">{p.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton" />)}</div>
      ) : visits.length === 0 ? (
        <div className="rounded-3xl surface-card p-8 text-center">
          <MapPin className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">Aucune visite enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit, i) => (
            <motion.div
              key={visit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-3xl surface-card p-5 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    visit.isCompleted ? 'bg-gold-400/20 text-gold-700' : visit.isActive ? 'bg-navy-900 text-gold-400' : 'bg-sky-100 text-navy-700'
                  }`}>
                    {visit.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">
                      Visite chez {visit.families?.map((f) => f.lastName).join(', ') || 'Famille inconnue'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(visit.startDate).toLocaleDateString('fr-FR')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(visit.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{visit.users?.[0]?.name || 'Non assigné'}</span>
                    </div>
                    {visit.notes && <p className="mt-2 text-xs text-ink-500 bg-ink-50 rounded-xl p-2">{visit.notes}</p>}
                  </div>
                </div>
                <div className="shrink-0">
                  {visit.isCompleted ? (
                    <span className="rounded-full bg-gold-400/20 text-navy-800 px-2.5 py-0.5 text-[10px] font-semibold border border-gold-400/40">Terminée</span>
                  ) : visit.isActive ? (
                    <span className="rounded-full bg-coral-400 text-white px-2.5 py-0.5 text-[10px] font-semibold">En cours</span>
                  ) : (
                    <span className="rounded-full bg-ink-100 text-ink-600 px-2.5 py-0.5 text-[10px] font-semibold border border-ink-200">Planifiée</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
