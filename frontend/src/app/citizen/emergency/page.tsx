"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost, queueOfflineEvent } from "@/services/api";

export default function EmergencyPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [timer, setTimer] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Detect online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 28.6139, lng: 77.2090 }) // Default: Delhi
      );
    }
  }, []);

  // Timer when triggered
  useEffect(() => {
    if (triggered) {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [triggered]);

  const triggerSOS = useCallback(async () => {
    setTriggered(true);
    setLoading(true);

    const payload = {
      panic_trigger: true,
      text: description || "Emergency SOS triggered",
      location: location,
      trigger_mode: "panic_button",
      environment_hints: getEnvironmentHints(),
      offline: !isOnline,
    };

    if (!isOnline) {
      queueOfflineEvent(payload);
      setResponse({
        severity: "critical",
        recommended_actions: [
          "📡 OFFLINE MODE — Emergency data saved locally",
          "📍 Last known location recorded",
          "🔔 Alert will be sent when connection restored",
          "🚶 Move to nearest well-lit public area",
          "📱 Keep this screen open",
        ],
        offline_mode: true,
      });
      setLoading(false);
      return;
    }

    try {
      const result = await apiPost("/emergency/trigger", payload);
      setResponse(result);
    } catch {
      queueOfflineEvent(payload);
      setResponse({
        severity: "critical",
        recommended_actions: ["📡 Offline — data saved locally", "🔔 Will sync when online"],
        offline_mode: true,
      });
    }
    setLoading(false);
  }, [description, location, isOnline]);

  function getEnvironmentHints(): string[] {
    const hints: string[] = [];
    const hour = new Date().getHours();
    if (hour >= 20 || hour <= 5) { hints.push("dark", "night"); }
    return hints;
  }

  const resetSOS = () => {
    setTriggered(false);
    setResponse(null);
    setTimer(0);
    setDescription("");
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="gradient-text-danger">Emergency SOS</span>
          </h1>
          <p className="text-slate-400">
            {isOnline ? (
              <span className="flex items-center justify-center gap-2"><span className="status-dot status-active"></span> Connected — Ready for emergency</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><span className="status-dot status-warning"></span> Offline Mode — Data will be cached locally</span>
            )}
          </p>
        </motion.div>

        {/* Location status */}
        {location && (
          <div className="glass-card p-3 mb-6 flex items-center gap-3 text-sm">
            <span>📍</span>
            <span className="text-slate-400">Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
              <span className="status-dot status-active"></span> GPS Active
            </span>
          </div>
        )}

        {/* Pre-SOS: Description input */}
        {!triggered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <label className="block text-sm text-slate-400 mb-2">Optional: Describe your situation</label>
            <textarea
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 resize-none"
              rows={3}
              placeholder="E.g., Someone is following me in a dark alley..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {/* Voice trigger keywords */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["Help me", "Bachao", "Someone following me", "I'm scared", "Emergency"].map((kw) => (
                <button
                  key={kw}
                  onClick={() => setDescription(kw)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all"
                >
                  🎙️ {kw}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* SOS Button */}
        {!triggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-12"
          >
            <button
              onClick={triggerSOS}
              className="relative w-56 h-56 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-2xl shadow-2xl emergency-btn hover:from-red-600 hover:to-red-800 active:scale-95 transition-all"
            >
              {/* Ripple rings */}
              <span className="absolute inset-0 rounded-full border-2 border-red-500/30 emergency-ring"></span>
              <span className="absolute inset-[-15px] rounded-full border border-red-500/20 emergency-ring" style={{ animationDelay: "0.5s" }}></span>
              <span className="absolute inset-[-30px] rounded-full border border-red-500/10 emergency-ring" style={{ animationDelay: "1s" }}></span>

              <div className="relative z-10">
                <div className="text-5xl mb-2">🆘</div>
                <div>PRESS SOS</div>
                <div className="text-xs font-normal mt-1 opacity-70">Tap to activate</div>
              </div>
            </button>
            <p className="text-slate-500 text-sm mt-6 text-center max-w-xs">
              Press the SOS button to immediately alert emergency contacts and nearby authorities
            </p>
          </motion.div>
        )}

        {/* Triggered State */}
        <AnimatePresence>
          {triggered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Active alert banner */}
              <div className="glass-card p-6 mb-6 border-red-500/30 bg-red-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="status-dot status-critical"></span>
                    <span className="text-red-400 font-bold text-lg">SOS ACTIVE</span>
                  </div>
                  <div className="text-2xl font-mono text-red-400">
                    {Math.floor(timer / 60).toString().padStart(2, "0")}:{(timer % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-5 h-5 border-2 border-t-red-400 border-white/20 rounded-full animate-spin"></div>
                    Processing emergency...
                  </div>
                ) : response && (
                  <div>
                    {/* Severity badge */}
                    <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 severity-${response.severity || "critical"}`}>
                      {(response.severity || "critical").toUpperCase()} SEVERITY
                    </div>

                    {response.risk_score !== undefined && (
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-sm text-slate-400">Risk Score:</span>
                        <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-1000"
                            style={{ width: `${(response.risk_score || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-red-400 font-bold">{((response.risk_score || 0) * 100).toFixed(0)}%</span>
                      </div>
                    )}

                    {/* Actions */}
                    {response.recommended_actions && (
                      <div className="space-y-2 mb-4">
                        {response.recommended_actions.map((action: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="p-3 rounded-lg bg-white/5 text-sm text-slate-300"
                          >
                            {action}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Safe zone */}
                    {response.nearest_safe_zone && (
                      <div className="glass-card p-4 border-green-500/20 bg-green-500/5">
                        <div className="text-sm text-green-400 font-medium mb-1">🏃 Nearest Safe Zone</div>
                        <div className="text-white font-semibold">{response.nearest_safe_zone}</div>
                        {response.escape_route && (
                          <div className="text-xs text-slate-400 mt-1">{response.escape_route}</div>
                        )}
                      </div>
                    )}

                    {/* Contacts notified */}
                    {response.contacts_notified && response.contacts_notified.length > 0 && (
                      <div className="mt-4 glass-card p-4 border-blue-500/20 bg-blue-500/5">
                        <div className="text-sm text-blue-400 font-medium mb-2">📱 Contacts Notified</div>
                        {response.contacts_notified.map((c: string, i: number) => (
                          <div key={i} className="text-sm text-slate-300 flex items-center gap-2 py-1">
                            <span className="status-dot status-active"></span> {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cancel button */}
              <button
                onClick={resetSOS}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Cancel Emergency
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick info cards */}
        {!triggered && (
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { icon: "📡", title: "Offline Ready", desc: "Works without internet" },
              { icon: "🎙️", title: "Voice Trigger", desc: "Say 'Help' or 'Bachao'" },
              { icon: "📍", title: "Live Tracking", desc: "GPS location shared" },
              { icon: "📸", title: "Auto Capture", desc: "Evidence recording" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-4 text-center hover-lift">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-bold text-white">{item.title}</div>
                <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
