"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { apiGet } from "@/services/api";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet (SSR-incompatible)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });

export default function MapPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [safeZones, setSafeZones] = useState<any[]>([]);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadMapData();
  }, []);

  const loadMapData = async () => {
    const [incRes, safeRes] = await Promise.all([
      apiGet("/map/incidents"),
      apiGet("/map/safe-zones"),
    ]);
    if (!incRes.error) setIncidents(incRes.markers || []);
    if (!safeRes.error) setSafeZones(safeRes.locations || []);
  };

  const filteredIncidents = useMemo(() => {
    if (filterType === "all") return incidents;
    return incidents.filter((i) => i.type === filterType);
  }, [incidents, filterType]);

  const severityColor: Record<string, string> = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#10b981",
  };

  const safeZoneColor: Record<string, string> = {
    police_station: "#3b82f6",
    hospital: "#10b981",
    shelter: "#8b5cf6",
    fire_station: "#f97316",
  };

  const safeZoneIcon: Record<string, string> = {
    police_station: "🚓",
    hospital: "🏥",
    shelter: "🏠",
    fire_station: "🚒",
  };

  return (
    <div className="min-h-screen">
      {/* Header bar */}
      <div className="px-4 py-4 glass-card" style={{ borderRadius: 0 }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black gradient-text">Geospatial Intelligence</h1>
            <p className="text-xs text-slate-500">Real-time incident & safe zone mapping</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter */}
            <div className="flex gap-1">
              {["all", "disaster", "women_safety", "medical", "combined"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === t ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t === "all" ? "All" : t.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={showIncidents} onChange={(e) => setShowIncidents(e.target.checked)} className="accent-cyan-500" />
              Incidents
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={showSafeZones} onChange={(e) => setShowSafeZones(e.target.checked)} className="accent-green-500" />
              Safe Zones
            </label>

            {/* Stats */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs">
              <span className="text-slate-500">📍 {filteredIncidents.length} incidents</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">🏥 {safeZones.length} safe zones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: "calc(100vh - 130px)" }}>
        {mounted ? (
          <>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <MapContainer
              center={[28.6139, 77.2090]}
              zoom={12}
              style={{ height: "100%", width: "100%", background: "#0a0e1a" }}
              // @ts-ignore
              key="main-map"
            >
              <TileLayer
                // @ts-ignore
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* Incidents */}
              {showIncidents && filteredIncidents.map((inc) => (
                <CircleMarker
                  key={inc.id}
                  // @ts-ignore
                  center={[inc.lat, inc.lng]}
                  radius={inc.severity === "critical" ? 14 : inc.severity === "high" ? 11 : 8}
                  pathOptions={{
                    fillColor: severityColor[inc.severity] || "#eab308",
                    color: severityColor[inc.severity] || "#eab308",
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-xs" style={{ minWidth: 180 }}>
                      <div className="font-bold text-sm mb-1 capitalize">{inc.type?.replace("_", " ")}</div>
                      <div className="mb-1">{inc.text}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold uppercase">{inc.severity}</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px]">{inc.status}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* Safe Zones */}
              {showSafeZones && safeZones.map((sz) => (
                <CircleMarker
                  key={sz.id}
                  // @ts-ignore
                  center={[sz.lat, sz.lng]}
                  radius={7}
                  pathOptions={{
                    fillColor: safeZoneColor[sz.type] || "#3b82f6",
                    color: "#ffffff",
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-xs" style={{ minWidth: 150 }}>
                      <div className="font-bold text-sm mb-1">{safeZoneIcon[sz.type] || "📍"} {sz.name}</div>
                      <div className="capitalize text-gray-500">{sz.type?.replace("_", " ")}</div>
                      {sz.district && <div className="text-gray-400 mt-1">{sz.district}</div>}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-[#0a0e1a]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-t-cyan-400 border-white/20 rounded-full animate-spin mx-auto mb-3"></div>
              <div className="text-slate-500 text-sm">Loading geospatial view...</div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 glass-card p-4 z-[1000]" style={{ maxWidth: 200 }}>
          <div className="text-xs font-bold text-slate-400 mb-2">Legend</div>
          <div className="space-y-1.5">
            {[
              { color: "#ef4444", label: "Critical" },
              { color: "#f97316", label: "High" },
              { color: "#eab308", label: "Medium" },
              { color: "#10b981", label: "Low / Safe Zone" },
              { color: "#3b82f6", label: "Police" },
              { color: "#8b5cf6", label: "Shelter" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
