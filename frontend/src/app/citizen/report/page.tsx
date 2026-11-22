"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost } from "@/services/api";

export default function ReportPage() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 28.6139, lng: 77.2090 })
      );
    }
  }, []);

  const submitReport = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await apiPost("/reports/create", {
      text,
      language,
      location,
    });

    setResult(res);
    setLoading(false);
  };

  const reset = () => {
    setText("");
    setResult(null);
  };

  const exampleReports = [
    "Heavy flooding near the river, water level rising fast",
    "Fire in the market area, thick smoke visible",
    "Road accident on highway, multiple vehicles involved",
    "Earthquake tremors, building cracks visible",
    "Someone is following me at night, I feel unsafe",
    "Person found unconscious on the road, not breathing",
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="gradient-text">Report</span> Incident
          </h1>
          <p className="text-slate-400">Describe the emergency — AI will classify, prioritize, and respond</p>
        </motion.div>

        {!result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Language selector */}
            <div className="flex gap-3 mb-6">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === lang.code
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-300 border"
                      : "glass-card text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Report text */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2 font-medium">Describe the incident</label>
              <textarea
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none text-lg"
                rows={5}
                placeholder="What is happening? Describe the situation..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* Example reports */}
            <div className="mb-6">
              <label className="block text-xs text-slate-500 mb-2">Quick examples (tap to use):</label>
              <div className="flex flex-wrap gap-2">
                {exampleReports.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setText(ex)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    {ex.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            {location && (
              <div className="glass-card p-3 mb-6 flex items-center gap-3 text-sm">
                <span>📍</span>
                <span className="text-slate-400">Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                <span className="ml-auto text-xs text-green-400">GPS Attached</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submitReport}
              disabled={loading || !text.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin"></div>
                  AI Processing...
                </span>
              ) : (
                "🧠 Submit & Analyze"
              )}
            </button>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !result.error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Classification card */}
              <div className="glass-card p-6 mb-6 border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">AI Classification</div>
                    <div className="text-2xl font-bold text-white capitalize">
                      {result.incident_type?.replace("_", " ")}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold severity-${result.severity}`}>
                    {result.severity?.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-slate-500">Confidence</div>
                    <div className="font-bold text-cyan-400">{((result.confidence || 0) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-slate-500">Incident ID</div>
                    <div className="font-bold text-blue-400">#{result.incident_id?.slice(0, 8)}</div>
                  </div>
                </div>

                {/* Keywords */}
                {result.keywords && result.keywords.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-slate-500 mb-2">Detected Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-blue-500/10 text-xs text-blue-300 border border-blue-500/20">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended actions */}
              <div className="glass-card p-6 mb-6 border-green-500/20 bg-green-500/5">
                <h3 className="text-lg font-bold text-green-400 mb-4">📋 Recommended Actions</h3>
                <div className="space-y-2">
                  {result.recommended_actions?.map((action: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="p-3 rounded-lg bg-white/5 text-sm text-slate-200"
                    >
                      {action}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Safe zone */}
              {result.nearest_safe_zone && (
                <div className="glass-card p-4 mb-6 border-blue-500/20 bg-blue-500/5">
                  <span className="text-sm text-blue-400 font-medium">📍 Nearest: </span>
                  <span className="text-white font-semibold">{result.nearest_safe_zone}</span>
                </div>
              )}

              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                🔄 New Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
