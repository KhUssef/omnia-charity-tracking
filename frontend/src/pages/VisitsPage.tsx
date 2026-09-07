import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Circle,
  Target,
} from 'lucide-react';
import { api } from '../services/api';
import type { VisitPlan, Visit } from '../types';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

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
    html: `<div style="
      background-color: ${color};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

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
  }, []);

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setWorkerPos({ lat: latitude, lng: longitude });
            const p = await api.getVisitPlan(latitude, longitude);
            setPlan(p);
            setPlanLoading(false);
          },
          async () => {
            const p = await api.getVisitPlan();
            setPlan(p);
            setPlanLoading(false);
          }
        );
      } else {
        const p = await api.getVisitPlan();
        setPlan(p);
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

  const markerColors = ['#d97706', '#059669', '#d97706', '#e11d48', '#7c3aed', '#db2777'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Planification</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold text-stone-900">Visites & Itinéraires</h1>
          <p className="mt-2 text-stone-500 text-sm">Suivi des visites et optimisation des itinéraires par géolocalisation.</p>
        </div>
        <button
          onClick={generatePlan}
          disabled={planLoading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-800 hover:scale-[1.02] disabled:opacity-60 transition-all duration-200"
        >
          <Navigation className="w-4 h-4" />
          {planLoading ? 'Calcul en cours...' : 'Générer un plan optimisé'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-200">{error}</div>
      )}

      {plan.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl overflow-hidden shadow-lg shadow-stone-200/30 border border-stone-100 bg-white"
        >
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-stone-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-600" />
              Carte de planification
            </h3>
            {workerPos && (
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Votre position estimée
              </span>
            )}
          </div>
          <div className="h-[28rem] w-full">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full z-0">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {workerPos && (
                <>
                  <Marker
                    position={[workerPos.lat, workerPos.lng]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: #3b82f6; color: white; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
                      iconSize: [14, 14],
                      iconAnchor: [7, 7],
                    })}
                  >
                    <Popup>Votre position</Popup>
                  </Marker>
                  <RecenterMap lat={workerPos.lat} lng={workerPos.lng} />
                </>
              )}
              {plan.map((p, i) => (
                <Marker
                  key={p.familyId}
                  position={[p.latitude, p.longitude]}
                  icon={createNumberedIcon(i + 1, markerColors[i % markerColors.length])}
                >
                  <Popup>
                    <div className="space-y-1 min-w-[12rem]">
                      <p className="font-display font-bold text-sm">{i + 1}. {p.familyName}</p>
                      <p className="text-xs text-stone-500">{p.address}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          p.priority > 70 ? 'bg-rose-100 text-rose-700' : p.priority > 40 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          Priorité {p.priority}
                        </span>
                        {p.distance !== undefined && <span className="text-[10px] text-stone-500">{p.distance.toFixed(1)} km</span>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="p-4 border-t border-stone-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.slice(0, 6).map((p, i) => (
                <div key={p.familyId} className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2 border border-stone-100">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: markerColors[i % markerColors.length] }}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">{p.familyName}</p>
                    <p className="text-[10px] text-stone-400 truncate">{p.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {plan.length === 0 && !planLoading && (
        <div className="mb-8 rounded-2xl bg-white p-8 text-center border border-stone-100">
          <Navigation className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500">Cliquez sur "Générer un plan optimisé" pour afficher la carte avec l'itinéraire suggéré.</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-stone-100 skeleton" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center border border-stone-100">
          <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">Aucune visite enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit, i) => (
            <motion.div
              key={visit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-white p-5 border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    visit.isCompleted ? 'bg-emerald-50 text-emerald-600' : visit.isActive ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {visit.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">Visite chez {visit.family?.lastName || 'Famille inconnue'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(visit.startDate).toLocaleDateString('fr-FR')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(visit.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{visit.user?.name || 'Non assigné'}</span>
                    </div>
                    {visit.notes && <p className="mt-2 text-xs text-stone-500 bg-stone-50 rounded-lg p-2 border border-stone-100">{visit.notes}</p>}
                  </div>
                </div>
                <div className="shrink-0">
                  {visit.isActive && !visit.isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-[10px] font-semibold border border-brand-200">
                      En cours
                    </span>
                  )}
                  {visit.isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-semibold border border-emerald-200">
                      Terminée
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
