/*
 * Landing.tsx – AjánlatAI landing page
 * Design: Dark SaaS / startup demo aesthetic
 * Colors: Deep forest green hero + white content + amber accents
 * Typography: Figtree (headings, bold) + Inter (body)
 * Layout: Full-width sections, asymmetric hero, card-based features
 */

import React from "react";
import { useLocation } from "wouter";
import {
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  LayoutList,
  FileText,
  Send,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Shield,
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663484075883/FvhNQaASWDn62j9UMjwGNV/hero-bg-UerjAEvwRqYtTwHUuJe3gR.webp";
const ROI_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663484075883/FvhNQaASWDn62j9UMjwGNV/roi-visual-CAApARtdK6MEN8Mq4GuHRz.webp";

const DEMO_SAMPLES = [
  {
    id: "csaladi_haz",
    label: "🏠 Családi ház csomag",
    desc: "4 ablak + erkélyajtó + bejárat",
  },
  {
    id: "erkelyajto",
    label: "🚪 Erkélyajtó + redőny",
    desc: "Panel lakás, bukó-nyíló",
  },
  {
    id: "bejarat",
    label: "🔑 Bejárati ajtó",
    desc: "Antracit, biztonsági",
  },
  {
    id: "komplex",
    label: "🏗️ Komplex felmérés",
    desc: "Irodaépület, 8 tétel",
  },
];

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Szabad szöveges feldolgozás",
    desc: "Írd be az igényt ahogy elhangzott – az AI strukturált tételekké alakítja másodpercek alatt.",
  },
  {
    icon: <LayoutList className="w-5 h-5" />,
    title: "Szerkeszthető tételkártyák",
    desc: "Minden felismert tétel azonnal ellenőrizhető és módosítható. Human-in-the-loop workflow.",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Operátori handoff",
    desc: "Másolható, strukturált összesítő Visual Window és Klaes rendszerekbe való gyors átvitelhez.",
  },
  {
    icon: <Send className="w-5 h-5" />,
    title: "Ügyfél-email vázlat",
    desc: "Professzionális magyar email szöveg generálása egy kattintással, azonnal küldhető.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Bejövő igény rögzítése",
    desc: "Ügyfél adatok + szabad szöveges igény beírása. Akár telefonon diktált szöveg is működik.",
    color: "from-green-900 to-green-800",
  },
  {
    num: "02",
    title: "AI feldolgozás",
    desc: "A rendszer felismeri a méretet, kategóriát, nyitásmódot, színt, kiegészítőket – és strukturált tételeket hoz létre.",
    color: "from-green-800 to-green-700",
  },
  {
    num: "03",
    title: "Operátori handoff",
    desc: "Ellenőrzés, szerkesztés, majd másolható összesítő + ügyfél email + nyomtatható ajánlat.",
    color: "from-green-700 to-green-600",
  },
];

const ROI_STATS = [
  { label: "Korábbi folyamat", value: "30–60 perc", sub: "ajánlatonként", negative: true },
  { label: "AjánlatAI-val", value: "5–10 perc", sub: "előkészítés", positive: true },
  { label: "Megtakarítás", value: "~80%", sub: "adminisztrációs idő", highlight: true },
  { label: "Kevesebb hiányzó adat", value: "−90%", sub: "visszakérdezés", highlight: true },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  const startDemo = (sampleId?: string) => {
    if (sampleId) {
      sessionStorage.setItem("demo_sample", sampleId);
    }
    setLocation("/demo");
  };

  return (
    <div className="min-h-screen bg-white font-[Inter]">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "oklch(0.32 0.09 152)" }}
            >
              AI
            </div>
            <span className="font-bold text-gray-900 font-[Figtree] text-sm">
              AjánlatAI
            </span>
            <span className="hidden sm:inline text-xs text-gray-400 ml-1">
              · Nyílászáró ajánlatgyorsító
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/")}
              className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              Előkészítő eszköz
            </button>
            <button
              onClick={() => startDemo()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-all hover:brightness-95"
              style={{ background: "oklch(0.32 0.09 152)" }}
            >
              Demó indítása
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-14"
        style={{ background: "oklch(0.20 0.07 152)" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.20_0.07_152)] via-[oklch(0.22_0.08_152)]/80 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-200 font-medium">
                Magyar nyílászárós cégeknek · MVP demo
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-[Figtree] leading-[1.1] mb-5">
              AI ajánlatgyorsító{" "}
              <span
                className="block"
                style={{ color: "oklch(0.80 0.15 80)" }}
              >
                nyílászáró cégeknek
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-2xl leading-relaxed">
              Gyors ügyfélfelvétel, strukturált tételek, operátori handoff Visual vagy Klaes workflow-ba.{" "}
              <span className="text-white font-medium">Nem kiváltja – gyorsítja.</span>
            </p>

            {/* Value bullets */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                "Kevesebb kézi adminisztráció",
                "Gyorsabb ajánlat-előkészítés",
                "Magyar nyelvű, demózható workflow",
              ].map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-green-100">{v}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => startDemo()}
                className="inline-flex items-center gap-2 text-base font-bold px-6 py-3 rounded-xl text-gray-900 transition-all hover:brightness-95 active:scale-95 shadow-lg"
                style={{ background: "oklch(0.80 0.15 80)" }}
              >
                <Zap className="w-4 h-4" />
                Demó indítása
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLocation("/")}
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Előkészítő eszköz
              </button>
            </div>

            {/* Social proof hint */}
            <p className="mt-6 text-xs text-green-300/70">
              Nem igényel regisztrációt · Azonnal használható · Adatok csak a böngészőben tárolódnak
            </p>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-2 block">
              Hogyan működik
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[Figtree]">
              3 lépés, percek alatt
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Az ajánlat-előkészítés teljes folyamata egyetlen felületen, emberi ellenőrzéssel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-green-200 to-transparent z-10 -translate-x-6" />
                )}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg font-[Figtree] mb-4"
                    style={{ background: `oklch(0.32 0.09 152)` }}
                  >
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 font-[Figtree] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20" style={{ background: "oklch(0.97 0.005 152)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-2 block">
              Funkciók
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[Figtree]">
              Minden, ami az előkészítéshez kell
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4"
                  style={{ background: "oklch(0.32 0.09 152)" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 font-[Figtree] mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROI BLOCK ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: stats */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-2 block">
                Megtérülés
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[Figtree] mb-4">
                Mérhető időmegtakarítás
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                A kézi ajánlatkészítés 30–60 percet vesz igénybe. Az AjánlatAI-val az előkészítés
                5–10 perc – az operátor csak ellenőriz és viszi át a végső rendszerbe.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {ROI_STATS.map((s, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border ${
                      s.highlight
                        ? "border-green-200 bg-green-50"
                        : s.negative
                        ? "border-red-100 bg-red-50/50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div
                      className={`text-2xl font-extrabold font-[Figtree] mb-0.5 ${
                        s.highlight
                          ? "text-green-700"
                          : s.negative
                          ? "text-red-500"
                          : "text-gray-800"
                      }`}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs font-semibold text-gray-600">{s.label}</div>
                    <div className="text-xs text-gray-400">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Nem kiváltja a Visual Window-t vagy Klaes-t.</strong> Az AjánlatAI az
                  operátori előszoba – gyorsabb, egységesebb adatot ad át a meglévő rendszernek.
                </p>
              </div>
            </div>

            {/* Right: image */}
            <div className="flex justify-center">
              <img
                src={ROI_IMG}
                alt="ROI vizualizáció"
                className="w-full max-w-sm rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── POSITIONING ─── */}
      <section
        className="py-16"
        style={{ background: "oklch(0.22 0.08 152)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Ajánlat-előkészítő",
                desc: "Nem ERP, nem CRM – csak az ajánlatkészítés gyorsítása",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "AI operátori előszoba",
                desc: "A bejövő igény strukturálása emberi ellenőrzéssel",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Visual/Klaes gyorsító",
                desc: "Nem kiváltja – gyorsabb, egységesebb adatot ad át",
              },
            ].map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-green-300">
                  {p.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-[Figtree]">{p.title}</div>
                  <div className="text-xs text-green-300 mt-1">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEMO CTA ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-[Figtree] mb-4">
            Próbáld ki most – 1 perc alatt érthető
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Válassz egy mintát és indítsd el a demo flow-t. Nem kell regisztráció, nem kell telepítés.
          </p>

          {/* Sample buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {DEMO_SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => startDemo(s.id)}
                className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all group text-left"
              >
                <span className="text-sm font-semibold text-gray-800 group-hover:text-green-800 font-[Figtree] leading-tight">
                  {s.label}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-green-600">
                  {s.desc}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 mt-auto" />
              </button>
            ))}
          </div>

          <button
            onClick={() => startDemo()}
            className="inline-flex items-center gap-2 text-base font-bold px-8 py-3.5 rounded-xl text-gray-900 transition-all hover:brightness-95 active:scale-95 shadow-lg"
            style={{ background: "oklch(0.80 0.15 80)" }}
          >
            <Zap className="w-4 h-4" />
            Demó indítása – üres lappal
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-8 border-t border-gray-100"
        style={{ background: "oklch(0.985 0.003 90)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "oklch(0.32 0.09 152)" }}
            >
              AI
            </div>
            <span className="text-sm font-semibold text-gray-700 font-[Figtree]">AjánlatAI</span>
            <span className="text-xs text-gray-400">· MVP · Nyílászáró ajánlatgyorsító</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Előkészítő eszköz
            </button>
            <button
              onClick={() => startDemo()}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Demo indítása
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
