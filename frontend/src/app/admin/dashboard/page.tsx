"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiGet } from "@/services/api";
import Link from "next/link";

export default function DashboardPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    const [casesRes, summaryRes] = await Promise.all([
      apiGet("/dashboard/cases?limit=20"),
      apiGet("/dashboard/summary"),
    ]);
    if (!casesRes.error) setCases(casesRes.cases || []);
    if (!summaryRes.error) setSummary(summaryRes);
    setLoading(false);
  };

  const severityIcon: Record<string, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
  };

  const typeIcon: Record<string, string> = {
    disaster: "🌊",
    women_safety: "👩‍🦱",
    medical: "🏥",
    combined: "⚡",
    unknown: "❓",
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">
              <span className="gradient-text">Command</span> Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time incident monitoring & response coordination</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/map" className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all">
              🗺️ Map View
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="status-dot status-active"></span>
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total", value: summary.total_incidents, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Active", value: summary.active_incidents, color: "text-orange-400", bg: "bg-orange-500/10" },
              { label: "Critical", value: summary.critical_count, color: "text-red-400", bg: "bg-red-500/10" },
              { label: "High", value: summary.high_count, color: "text-orange-400", bg: "bg-orange-500/10" },
              { label: "Medium", value: summary.medium_count, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Low", value: summary.low_count, color: "text-green-400", bg: "bg-green-500/10" },
            ].map((stat, i) => (
              <div key={i} className={`glass-card p-4 text-center hover-lift`}>
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Type distribution */}
        {summary?.by_type && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-400 mb-4">Incident Distribution by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(summary.by_type).map(([type, count], i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-xl">{typeIcon[type] || "📋"}</span>
                  <div>
                    <div className="text-sm font-bold capitalize text-white">{type.replace("_", " ")}</div>
                    <div className="text-xs text-slate-500">{count as number} incidents</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Case list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
            <span className="status-dot status-active"></span>
            Active Cases ({cases.length})
          </h3>

          {loading ? (
            <div className="glass-card p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-t-blue-400 border-white/20 rounded-full animate-spin mx-auto mb-3"></div>
              Loading cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">
              No incidents reported yet
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 hover-lift cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl mt-0.5">{typeIcon[c.type] || "📋"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white capitalize">{c.type?.replace("_", " ")}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold severity-${c.severity}`}>
                            {c.severity?.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-slate-500 capitalize">
                            {c.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{c.text}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>ID: #{c.id?.slice(0, 6)}</span>
                          {c.confidence && <span>Conf: {(c.confidence * 100).toFixed(0)}%</span>}
                          {c.location && <span>📍 {c.location.lat?.toFixed(3)}, {c.location.lng?.toFixed(3)}</span>}
                        </div>
                        {c.keywords && c.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.keywords.slice(0, 4).map((kw: string, ki: number) => (
                              <span key={ki} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-300">{kw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-slate-500">{severityIcon[c.severity]}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
