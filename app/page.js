"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const heroStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const revealUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const revealScale = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const stats = [
  {
    value: "15k+",
    label: "Resources Tracked",
    detail: "Vehicles, supplies, and personnel monitored in real time.",
    accent: "var(--primary)",
  },
  {
    value: "98.7%",
    label: "Forecast Confidence",
    detail: "Predictive signal quality maintained during critical events.",
    accent: "var(--secondary)",
  },
  {
    value: "30%",
    label: "Faster Deployment",
    detail: "Reduced dispatch latency through route and load balancing.",
    accent: "var(--tertiary)",
  },
];

const bentoCards = [
  {
    title: "Disaster Intelligence Grid",
    description:
      "Fuse weather models, geospatial signals, and field telemetry into one operational context layer.",
    icon: "monitoring",
    points: ["Satellite + ground synthesis", "Risk scoring by neighborhood"],
    className: "md:col-span-8",
    tone: "rgba(0,74,198,0.08)",
  },
  {
    title: "Unified Command Stream",
    description:
      "Shared situational view across agencies with synchronized timelines and decision logs.",
    icon: "hub",
    points: ["Role-aware coordination", "Single source of operational truth"],
    className: "md:col-span-4",
    tone: "rgba(0,104,122,0.08)",
  },
  {
    title: "Adaptive Route Engine",
    description:
      "Live rerouting based on closures, terrain, and real-time dispatch pressure.",
    icon: "route",
    points: ["Traffic-aware ETAs", "Automatic fallback paths"],
    className: "md:col-span-5",
    tone: "rgba(0,98,41,0.08)",
  },
  {
    title: "Resilience by Design",
    description:
      "Offline-ready nodes keep teams synchronized even under unstable connectivity.",
    icon: "wifi_off",
    points: ["Edge synchronization", "Conflict-safe local updates"],
    className: "md:col-span-7",
    tone: "rgba(37,99,235,0.08)",
  },
];

const responsePhases = [
  {
    title: "Detect",
    description: "Early anomaly detection from multi-source event streams.",
    icon: "radar",
  },
  {
    title: "Coordinate",
    description: "Cross-team orchestration with intelligent task suggestions.",
    icon: "emergency_share",
  },
  {
    title: "Deploy",
    description: "Optimized dispatch and live mission adjustment in seconds.",
    icon: "deployed_code",
  },
];

const partners = [
  "FEDERAL OPS",
  "RESCUE UNITE",
  "METRO EM",
  "GLOBAL AID",
  "SAFETY FIRST",
];

export default function Home() {
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const haloRotate = useTransform(scrollYProgress, [0, 1], [0, 28]);

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden antialiased bg-[var(--surface)] text-[var(--on-surface)]">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl h-20 px-6 md:px-8 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-lg md:text-xl font-bold tracking-tight"
          >
            Adaptive Sentinel
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "#features" },
              { label: "About", href: "#about" },
            ].map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                whileHover={{ y: -1 }}
                className="text-sm font-medium text-slate-600 hover:text-[var(--primary)] transition-colors"
              >
                {item.label}
              </motion.a>
            ))}

            <motion.div whileHover={{ y: -1 }}>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-[var(--primary)] transition-colors"
              >
                Login
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="gradient-button text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-300/25"
              >
                Request Access
              </Link>
            </motion.div>
          </div>

          <Link href="/login" className="md:hidden text-slate-900">
            <span className="material-symbols-outlined">menu</span>
          </Link>
        </nav>
      </header>

      <main className="pt-16">
        <section
          ref={heroRef}
          className="relative px-6 md:px-8 py-12 md:py-16 overflow-hidden"
        >
          <motion.div
            aria-hidden
            style={{ y: backgroundY, rotate: haloRotate }}
            className="pointer-events-none absolute -top-24 -right-20 w-[34rem] h-[34rem] rounded-full blur-[120px] opacity-35"
          >
            <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(37,99,235,0.6),rgba(37,99,235,0)_70%)]" />
          </motion.div>
          <motion.div
            aria-hidden
            animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-16 -left-24 w-[24rem] h-[24rem] rounded-full blur-[110px] opacity-35 bg-[radial-gradient(circle_at_45%_45%,rgba(0,104,122,0.5),rgba(0,104,122,0)_70%)]"
          />

          <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-14 items-center relative z-10">
            <motion.div
              variants={heroStagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={revealUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 rounded-full border border-cyan-200 bg-cyan-50/80 text-xs font-semibold tracking-[0.15em] text-cyan-700 uppercase"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                Live Orchestration Online
              </motion.div>

              <motion.h1
                variants={revealUp}
                className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
              >
                Adaptive
                <span className="gradient-text"> Intelligence </span>
                for
                <span className="gradient-text"> Crisis </span>
                Response
              </motion.h1>

              <motion.p
                variants={revealUp}
                className="mt-7 text-lg md:text-xl max-w-xl leading-relaxed text-[var(--on-surface-variant)]"
              >
                A refined control surface for high-pressure operations. Monitor,
                prioritize, and deploy with confidence through a motion-first,
                data-dense experience.
              </motion.p>

              <motion.div
                variants={revealUp}
                className="mt-10 flex flex-wrap gap-4"
              >
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/login"
                    className="gradient-button inline-flex items-center gap-2 text-white px-7 py-4 rounded-xl font-bold shadow-xl shadow-blue-300/30"
                  >
                    Request Access
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </Link>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold bg-white border border-slate-200 text-[var(--primary)] shadow-sm"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Explore Platform
                </motion.button>
              </motion.div>

              <motion.div
                variants={revealUp}
                className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl"
              >
                {[
                  { label: "Multi-agency", value: "12 Regions" },
                  { label: "Decision Time", value: "< 2 min" },
                  { label: "Live Feeds", value: "150+" },
                ].map((chip) => (
                  <motion.div
                    key={chip.label}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-md"
                  >
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {chip.label}
                    </div>
                    <div className="text-base font-bold mt-1 text-[var(--on-surface)]">
                      {chip.value}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              style={{ y: foregroundY }}
              variants={revealScale}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-500/15 via-cyan-300/10 to-emerald-400/15 blur-2xl" />

              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-[2rem] border border-white/70 shadow-2xl bg-white"
              >
                <img
                  className="w-full aspect-[5/4] object-cover"
                  alt="Command center overview"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC12Q2Hx-OMaXZrqnfb7bwckp_QDnvVl9KJjrBqxROAMk0dtRrsBY-tO9njpBdCYCWLVqk6mfs_cmikAGsrTNJ9dwHEI2xJgGIMO89r9xUfQk5kPZqVHWM5EYRRbrz0nh6vQEpT-xtDYemYaf7OosT4XIEtF-9K6p5JGwZj9FmFbaSTxflcPBC6YvUkQ-RA6Dy9HOhZdX8x6-JXyGV9EfV_PA3FRRgg78dEf-mfIxJ-5HrCa5kJNXbVjVBHEQRd9DH223IMJ9oqZqUW"
                />

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute left-5 right-5 bottom-5 p-5 rounded-2xl glass-card border border-white/70"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-700">
                      <span className="material-symbols-outlined">
                        verified
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        Deployment Confidence
                      </p>
                      <p className="text-xs mt-1 text-slate-600">
                        Mission package generated with route + staffing
                        validation.
                      </p>
                    </div>
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-emerald-600 text-xs font-bold"
                    >
                      99.2%
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="absolute -right-4 md:-right-10 top-8 w-48 rounded-2xl bg-slate-900 text-white p-4 shadow-2xl"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Live Queue
                </p>
                <p className="text-2xl font-bold mt-1">42</p>
                <p className="text-xs text-slate-400 mt-1">Pending missions</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="px-6 md:px-8 pb-20">
          <div className="mx-auto max-w-7xl grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.article
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                variants={cardReveal}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl p-7 border border-slate-200/90 bg-white shadow-[0_18px_40px_-32px_rgba(0,0,0,0.5)]"
                style={{ borderTop: `3px solid ${stat.accent}` }}
              >
                <p className="text-4xl font-black tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--on-surface-variant)]">
                  {stat.detail}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="py-14 px-6 md:px-8 border-y border-slate-200/70 bg-[var(--surface-container-low)]">
          <div className="mx-auto max-w-7xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              className="text-center text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-slate-500"
            >
              Trusted by leading emergency management agencies
            </motion.p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {partners.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.06, duration: 0.5 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold tracking-[0.14em] text-slate-500"
                >
                  {name}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 md:py-28 px-6 md:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              className="max-w-2xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                Platform Capabilities
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Frictionless operations under extreme pressure
              </h2>
              <p className="mt-5 text-lg text-[var(--on-surface-variant)]">
                A bento-style control layer that blends strategic oversight with
                tactical action. Every interaction is designed to reduce
                cognitive load during emergencies.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6">
              {bentoCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={cardReveal}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className={`${card.className} rounded-3xl border border-slate-200/80 p-7 md:p-8 bg-white relative overflow-hidden`}
                >
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-70"
                    style={{ backgroundColor: card.tone }}
                  />

                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        {card.icon}
                      </span>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-4 leading-relaxed text-[var(--on-surface-variant)]">
                      {card.description}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {card.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <span className="material-symbols-outlined text-base text-[var(--tertiary)]">
                            check_circle
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="py-24 md:py-28 px-6 md:px-8 bg-[var(--surface-container-low)] border-y border-slate-200/70"
        >
          <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                Response workflow
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Built for decisive execution, not dashboard theater
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[var(--on-surface-variant)]">
                Adaptive Sentinel combines predictive intelligence and human-led
                command design so teams can move from signal to action with less
                noise and more confidence.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: 0.2 }}
                className="mt-9"
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                >
                  Start a guided demo
                  <span className="material-symbols-outlined">north_east</span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={heroStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="space-y-4"
            >
              {responsePhases.map((phase, index) => (
                <motion.article
                  key={phase.title}
                  variants={revealUp}
                  whileHover={{ x: 6 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {phase.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Phase {index + 1}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">{phase.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--on-surface-variant)]">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative py-24 md:py-28 px-6 md:px-8 overflow-hidden bg-slate-950 text-white">
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.16, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-28 -right-28 w-96 h-96 rounded-full blur-[120px] bg-blue-500/35"
          />
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.12, 1], x: [0, -12, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full blur-[110px] bg-cyan-400/30"
          />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-4xl md:text-6xl font-black tracking-tight leading-tight"
            >
              Ready to modernize your emergency response stack?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="mt-7 text-lg md:text-xl text-slate-300 leading-relaxed"
            >
              Move from fragmented coordination to an elegant, real-time command
              workflow engineered for speed, clarity, and resilience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true, amount: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="gradient-button inline-block text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-500/25"
                >
                  Get Started Today
                </Link>
              </motion.div>

              <motion.button
                type="button"
                onClick={() => scrollToSection("about")}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl font-semibold border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Learn how it works
              </motion.button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-10 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-slate-500">
          <div className="text-center md:text-left">
            <p className="font-bold text-slate-900">Adaptive Sentinel</p>
            <p className="mt-1">
              © 2026 Adaptive Sentinel. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-[var(--primary)] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
