"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🚨",
    title: "Disaster Response",
    desc: "Flood, fire, earthquake detection with AI-powered severity scoring and evacuation guidance",
    color: "from-orange-500 to-red-500",
    link: "/citizen/report",
  },
  {
    icon: "👩‍🦱",
    title: "Women Safety AI",
    desc: "Panic button, voice trigger, stalking detection, and instant safe zone navigation",
    color: "from-pink-500 to-purple-500",
    link: "/citizen/emergency",
  },
  {
    icon: "🏥",
    title: "Medical AI",
    desc: "Injury detection, first aid guidance, triage scoring, and hospital finder — all AI-powered",
    color: "from-green-500 to-emerald-500",
    link: "/citizen/medical",
  },
  {
    icon: "📡",
    title: "Offline Emergency",
    desc: "Works WITHOUT internet — local AI inference, SMS fallback, auto-sync when reconnected",
    color: "from-blue-500 to-cyan-500",
    link: "/citizen/emergency",
  },
  {
    icon: "🧠",
    title: "Multimodal Fusion",
    desc: "Combines voice, image, text, location, and panic signals into unified risk assessment",
    color: "from-violet-500 to-indigo-500",
    link: "/citizen/report",
  },
  {
    icon: "📊",
    title: "Live Dashboard",
    desc: "Real-time incident map, severity heatmap, case queue, and authority dispatch panel",
    color: "from-cyan-500 to-blue-500",
    link: "/admin/dashboard",
  },
];

const stats = [
  { value: "< 3s", label: "Response Time" },
  { value: "6+", label: "AI Modules" },
  { value: "100%", label: "Offline Ready" },
  { value: "4", label: "Emergency Types" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 overflow-hidden">
        {/* Animated bg circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/3 blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
          >
            <span className="status-dot status-active"></span>
            AI-Powered National Safety Layer
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="gradient-text">Saarthi</span>{" "}
            <span className="text-white">Sentinel</span>{" "}
            <span className="gradient-text-danger">X</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed"
          >
            Unified AI Safety & Emergency Intelligence System
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base text-slate-500 max-w-2xl mx-auto mb-12 italic"
          >
            &ldquo;A multimodal, offline-first AI safety system that detects danger, assists victims, and orchestrates response across disaster, medical, and personal safety scenarios in real-time.&rdquo;
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/citizen/emergency"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
            >
              🚨 Emergency SOS
            </Link>
            <Link
              href="/citizen/report"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all hover:scale-105"
            >
              📝 Report Incident
            </Link>
            <Link
              href="/citizen/medical"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all hover:scale-105"
            >
              🏥 Medical AI
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-4 text-center hover-lift">
                <div className="text-3xl font-black gradient-text">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Unified Intelligence</span> Across All Threats
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              One system. Every emergency. AI-powered analysis with offline-first architecture.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={f.link}>
                  <div className="glass-card p-6 hover-lift cursor-pointer group h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="gradient-text">AI Pipeline</span> Architecture
            </h2>
          </motion.div>

          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Input */}
              <div className="text-center">
                <div className="text-3xl mb-2">📥</div>
                <div className="font-bold text-cyan-400">Input</div>
                <div className="text-xs text-slate-500 mt-1">Voice • Image • Text • SOS</div>
              </div>

              <div className="text-2xl text-slate-600">→</div>

              {/* AI Core */}
              <div className="text-center glass-card p-4 border-cyan-500/20">
                <div className="text-3xl mb-2">🧠</div>
                <div className="font-bold text-cyan-400">AI Perception</div>
                <div className="text-xs text-slate-500 mt-1">NLP • Vision • Fusion</div>
              </div>

              <div className="text-2xl text-slate-600">→</div>

              {/* Risk Engine */}
              <div className="text-center glass-card p-4 border-orange-500/20">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-bold text-orange-400">Risk Engine</div>
                <div className="text-xs text-slate-500 mt-1">Severity • Classification</div>
              </div>

              <div className="text-2xl text-slate-600">→</div>

              {/* Response */}
              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <div className="font-bold text-green-400">Response</div>
                <div className="text-xs text-slate-500 mt-1">Alerts • Guidance • Dispatch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="gradient-text font-bold text-xl mb-2">Saarthi Sentinel X</div>
          <p className="text-slate-500 text-sm">
            Unified Intelligence • Offline Operation • Real-Time Response
          </p>
          <p className="text-slate-600 text-xs mt-4">
            Built for National-Level Safety Infrastructure
          </p>
        </div>
      </footer>
    </div>
  );
}
