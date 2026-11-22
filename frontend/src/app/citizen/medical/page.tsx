"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost } from "@/services/api";

const quickInjuries = [
  { label: "🩸 Bleeding Wound", keywords: ["bleeding", "wound", "cut"] },
  { label: "🔥 Burn Injury", keywords: ["burn", "scalded", "fire_injury"] },
  { label: "🦴 Fracture", keywords: ["fracture", "broken", "bone"] },
  { label: "😵 Unconscious Person", keywords: ["unconscious", "unresponsive", "collapsed"] },
  { label: "❤️ Chest Pain", keywords: ["heart", "chest_pain", "cardiac"] },
  { label: "🐍 Snake Bite", keywords: ["snake", "bite", "venom"] },
  { label: "🤕 Head Injury", keywords: ["head", "concussion", "hit_head"] },
  { label: "💊 Poisoning", keywords: ["poison", "toxic", "vomiting"] },
];

export default function MedicalPage() {
  const [description, setDescription] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showDoctorSummary, setShowDoctorSummary] = useState(false);

  const selectQuickInjury = (keywords: string[], label: string) => {
    setSelectedKeywords(keywords);
    if (!description) {
      setDescription(label.replace(/^[^\s]+\s/, "") + " - need first aid guidance");
    }
  };

  const analyzeInjury = async () => {
    if (!description && selectedKeywords.length === 0) return;
    setLoading(true);
    setResult(null);

    const res = await apiPost("/medical/analyze", {
      description,
      injury_keywords: selectedKeywords,
      language: "en",
    });

    setResult(res);
    setLoading(false);
  };

  const reset = () => {
    setDescription("");
    setSelectedKeywords([]);
    setResult(null);
    setShowDoctorSummary(false);
  };

  const severityColors: Record<string, string> = {
    critical: "from-red-500 to-red-700",
    high: "from-orange-500 to-red-500",
    medium: "from-yellow-500 to-orange-500",
    low: "from-green-500 to-emerald-500",
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="gradient-text">Medical AI</span> Assistant
          </h1>
          <p className="text-slate-400">AI-powered injury assessment & first aid guidance</p>
        </motion.div>

        {!result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Quick select injury type */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3 font-medium">Select Injury Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickInjuries.map((inj, i) => (
                  <button
                    key={i}
                    onClick={() => selectQuickInjury(inj.keywords, inj.label)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all hover-lift ${
                      selectedKeywords.join() === inj.keywords.join()
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 border"
                        : "glass-card text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {inj.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description input */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2 font-medium">Describe the Injury / Symptoms</label>
              <textarea
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
                rows={4}
                placeholder="E.g., Deep cut on the hand with heavy bleeding, person is conscious..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Analyze button */}
            <button
              onClick={analyzeInjury}
              disabled={loading || (!description && selectedKeywords.length === 0)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin"></div>
                  Analyzing with Medical AI...
                </span>
              ) : (
                "🧠 Analyze & Get First Aid"
              )}
            </button>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !result.error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Injury classification */}
              <div className="glass-card p-6 mb-6 border-cyan-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">AI Diagnosis</div>
                    <div className="text-2xl font-bold text-white">{result.injury_type}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${severityColors[result.severity] || severityColors.medium} text-white`}>
                    {result.severity?.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-slate-500">Urgency</div>
                    <div className="font-bold text-orange-400 capitalize">{result.urgency_level}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-slate-500">Confidence</div>
                    <div className="font-bold text-cyan-400">{((result.confidence || 0) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-slate-500">Assessment</div>
                    <div className="font-bold text-green-400">#{result.assessment_id?.slice(0, 6)}</div>
                  </div>
                </div>
              </div>

              {/* First Aid Steps */}
              <div className="glass-card p-6 mb-6 border-green-500/20 bg-green-500/5">
                <h3 className="text-lg font-bold text-green-400 mb-4">🩹 First Aid Instructions</h3>
                <div className="space-y-3">
                  {result.first_aid?.map((step: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="p-3 rounded-lg bg-white/5 text-sm text-slate-200 leading-relaxed"
                    >
                      {step}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Do NOT instructions */}
              {result.do_not && result.do_not.length > 0 && (
                <div className="glass-card p-6 mb-6 border-red-500/20 bg-red-500/5">
                  <h3 className="text-lg font-bold text-red-400 mb-4">⚠️ Do NOT Do This</h3>
                  <div className="space-y-2">
                    {result.do_not.map((item: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="p-3 rounded-lg bg-red-500/5 text-sm text-red-300"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospital suggestion */}
              <div className="glass-card p-6 mb-6 border-blue-500/20 bg-blue-500/5">
                <h3 className="text-sm font-bold text-blue-400 mb-2">🏥 Hospital Recommendation</h3>
                <p className="text-white font-semibold">{result.hospital_suggestion}</p>
              </div>

              {/* Doctor summary toggle */}
              <div className="glass-card p-6 mb-6">
                <button
                  onClick={() => setShowDoctorSummary(!showDoctorSummary)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-bold text-purple-400">📋 Doctor-Ready Summary</span>
                  <span className="text-slate-500">{showDoctorSummary ? "▲" : "▼"}</span>
                </button>
                {showDoctorSummary && (
                  <motion.pre
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 rounded-lg bg-black/30 text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto"
                  >
                    {result.doctor_summary}
                  </motion.pre>
                )}
              </div>

              {/* New analysis button */}
              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                🔄 New Analysis
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
