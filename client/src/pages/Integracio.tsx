/**
 * /integracio – AI-assisted Visual Window / Klaes integration showcase page
 * Design: Modern B2B SaaS, forest green (#2D5A3D) + warm white + amber accents
 * Typography: Figtree (headings) + system sans (body)
 * Layout: Full-width sections, asymmetric content blocks, card grids
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Play,
  RotateCcw,
  Copy,
  Check,
  Wifi,
  Monitor,
  FileCheck,
  UserCheck,
  Database,
  Eye,
  Lock,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Home,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrukturaltMezo {
  cimke: string;
  ertek: string;
  allapot: "ok" | "figyelmeztetes" | "hianyzik";
}

interface WorkflowLepes {
  id: string;
  cim: string;
  leiras: string;
  allapot: "kesz" | "folyamatban" | "var" | "hiba";
  ido?: string;
}

interface DemoPreset {
  id: string;
  nev: string;
  szin: string;
  input: string;
  struktura: StrukturaltMezo[];
  rendszer: "visual" | "klaes";
}

// ─── Demo presets ─────────────────────────────────────────────────────────────

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "visual",
    nev: "Visual demo",
    szin: "green",
    rendszer: "visual",
    input: `2 db 120x150 bukó-nyíló jobb fehér Rehau ablak 3 rétegű üveggel, redőnnyel és szúnyoghálóval. Sürgős, határidő: 2 héten belül.`,
    struktura: [
      { cimke: "Kategória", ertek: "Ablak", allapot: "ok" },
      { cimke: "Profilrendszer", ertek: "Rehau", allapot: "ok" },
      { cimke: "Szélesség", ertek: "1200 mm", allapot: "ok" },
      { cimke: "Magasság", ertek: "1500 mm", allapot: "ok" },
      { cimke: "Darabszám", ertek: "2 db", allapot: "ok" },
      { cimke: "Nyitásmód", ertek: "Bukó-nyíló", allapot: "ok" },
      { cimke: "Nyitásirány", ertek: "Jobb", allapot: "ok" },
      { cimke: "Szín (kül/bel)", ertek: "Fehér / Fehér", allapot: "ok" },
      { cimke: "Üvegezés", ertek: "3 rétegű hőszigetelő", allapot: "ok" },
      { cimke: "Redőny", ertek: "Igen", allapot: "ok" },
      { cimke: "Szúnyogháló", ertek: "Igen", allapot: "ok" },
      { cimke: "Párkány", ertek: "Nincs megadva", allapot: "figyelmeztetes" },
      { cimke: "Megjegyzés", ertek: "Sürgős, 2 héten belül", allapot: "ok" },
    ],
  },
  {
    id: "klaes",
    nev: "Klaes demo",
    szin: "blue",
    rendszer: "klaes",
    input: `Erkélyajtó 90x210 egyszárnyú bal nyíló antracit Schüco, 2 rétegű üveg. Ügyfél: Kovács Bt. Budapest XIII. ker.`,
    struktura: [
      { cimke: "Kategória", ertek: "Erkélyajtó", allapot: "ok" },
      { cimke: "Profilrendszer", ertek: "Schüco", allapot: "ok" },
      { cimke: "Szélesség", ertek: "900 mm", allapot: "ok" },
      { cimke: "Magasság", ertek: "2100 mm", allapot: "ok" },
      { cimke: "Darabszám", ertek: "1 db", allapot: "ok" },
      { cimke: "Nyitásmód", ertek: "Nyíló", allapot: "ok" },
      { cimke: "Nyitásirány", ertek: "Bal", allapot: "ok" },
      { cimke: "Szín (kül/bel)", ertek: "Antracit / Antracit", allapot: "ok" },
      { cimke: "Üvegezés", ertek: "2 rétegű hőszigetelő", allapot: "ok" },
      { cimke: "Redőny", ertek: "Nincs megadva", allapot: "figyelmeztetes" },
      { cimke: "Küszöb típus", ertek: "Nincs megadva", allapot: "hianyzik" },
      { cimke: "Ügyfél", ertek: "Kovács Bt.", allapot: "ok" },
      { cimke: "Helyszín", ertek: "Budapest XIII. ker.", allapot: "ok" },
    ],
  },
  {
    id: "standard",
    nev: "Standard ajánlat",
    szin: "amber",
    rendszer: "visual",
    input: `Bejárati ajtó 100x210 tömör fehér Veka, 5 pontos zárral, biztonsági üveggel. Csere, meglévő tok marad.`,
    struktura: [
      { cimke: "Kategória", ertek: "Bejárati ajtó", allapot: "ok" },
      { cimke: "Profilrendszer", ertek: "Veka", allapot: "ok" },
      { cimke: "Szélesség", ertek: "1000 mm", allapot: "ok" },
      { cimke: "Magasság", ertek: "2100 mm", allapot: "ok" },
      { cimke: "Darabszám", ertek: "1 db", allapot: "ok" },
      { cimke: "Nyitásmód", ertek: "Nyíló (tömör)", allapot: "ok" },
      { cimke: "Szín (kül/bel)", ertek: "Fehér / Fehér", allapot: "ok" },
      { cimke: "Üvegezés", ertek: "Biztonsági üveg", allapot: "ok" },
      { cimke: "Zár", ertek: "5 pontos biztonsági zár", allapot: "ok" },
      { cimke: "Tok", ertek: "Meglévő tok marad", allapot: "ok" },
      { cimke: "Nyitásirány", ertek: "Nincs megadva", allapot: "hianyzik" },
      { cimke: "Küszöb típus", ertek: "Nincs megadva", allapot: "figyelmeztetes" },
    ],
  },
];

// ─── Workflow steps ────────────────────────────────────────────────────────────

const WORKFLOW_LEPESEK_VISUAL: WorkflowLepes[] = [
  { id: "vpn", cim: "VPN kapcsolat aktív", leiras: "Biztonságos csatorna létrehozva a céges hálózathoz", allapot: "var" },
  { id: "session", cim: "Visual munkamenet elindítva", leiras: "Visual Window alkalmazás csatlakoztatva", allapot: "var" },
  { id: "screen", cim: "Ajánlat képernyő megnyitva", leiras: "Új ajánlat beviteli felület aktív", allapot: "var" },
  { id: "ugyfel", cim: "Ügyféladatok kitöltése", leiras: "Név, cím, elérhetőség automatikusan rögzítve", allapot: "var" },
  { id: "tetelek", cim: "Tételek rögzítése", leiras: "Strukturált mezők beillesztése a Visual rendszerbe", allapot: "var" },
  { id: "validacio", cim: "Hiányzó mező ellenőrzése", leiras: "Validáció futtatása, figyelmeztetések jelzése", allapot: "var" },
  { id: "jovahagyas", cim: "Operátori jóváhagyásra vár", leiras: "Az operátor ellenőrzi és jóváhagyja az adatokat", allapot: "var" },
  { id: "mentes", cim: "Mentés kész", leiras: "Ajánlat rögzítve a Visual Window rendszerben", allapot: "var" },
];

const WORKFLOW_LEPESEK_KLAES: WorkflowLepes[] = [
  { id: "vpn", cim: "VPN kapcsolat aktív", leiras: "Biztonságos csatorna a Klaes szerverhez", allapot: "var" },
  { id: "session", cim: "Klaes munkamenet elindítva", leiras: "Klaes alkalmazás csatlakoztatva és bejelentkezve", allapot: "var" },
  { id: "screen", cim: "Megrendelés modul megnyitva", leiras: "Klaes megrendelés-rögzítő képernyő aktív", allapot: "var" },
  { id: "ugyfel", cim: "Ügyfél és projekt adatok", leiras: "Ügyfélkártya és projekt azonosító rögzítve", allapot: "var" },
  { id: "tetelek", cim: "Pozíciók rögzítése", leiras: "Klaes pozíció-struktúra szerint automatikus kitöltés", allapot: "var" },
  { id: "validacio", cim: "Klaes validáció futtatása", leiras: "Rendszer ellenőrzi a kötelező Klaes mezőket", allapot: "var" },
  { id: "jovahagyas", cim: "Operátori ellenőrzés", leiras: "Operátor átnézi a pozíciókat és jóváhagyja", allapot: "var" },
  { id: "mentes", cim: "Klaes mentés és nyomtatás", leiras: "Megrendelés elmentve, ajánlat nyomtatható", allapot: "var" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function AllapotJel({ allapot }: { allapot: StrukturaltMezo["allapot"] }) {
  if (allapot === "ok") return <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />;
  if (allapot === "figyelmeztetes") return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
}

function WorkflowLog({ lepesek, rendszer }: { lepesek: WorkflowLepes[]; rendszer: string }) {
  return (
    <div className="bg-[#0f1419] rounded-xl overflow-hidden border border-[#1e2d1e] shadow-xl">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161d16] border-b border-[#1e2d1e]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs font-mono text-green-400/70 ml-2">Automation Monitor — {rendszer} workflow</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-green-400/60">LIVE</span>
        </div>
      </div>
      {/* Log lines */}
      <div className="p-4 space-y-1.5 font-mono text-xs min-h-[280px]">
        {lepesek.map((l, i) => {
          const ts = `14:3${i}:${String(i * 7).padStart(2, "0")}`;
          const prefix =
            l.allapot === "kesz" ? <span className="text-green-400">SUCCESS</span>
            : l.allapot === "folyamatban" ? <span className="text-amber-400">RUNNING</span>
            : l.allapot === "hiba" ? <span className="text-red-400">ERROR  </span>
            : <span className="text-gray-600">PENDING</span>;
          const textColor =
            l.allapot === "kesz" ? "text-green-300"
            : l.allapot === "folyamatban" ? "text-amber-300"
            : l.allapot === "hiba" ? "text-red-300"
            : "text-gray-600";
          return (
            <div key={l.id} className={`flex items-start gap-2 ${textColor} transition-all duration-300`}>
              <span className="text-gray-600 flex-shrink-0">[{ts}]</span>
              <span className="flex-shrink-0">{prefix}</span>
              <span>{l.cim}{l.allapot === "folyamatban" ? <span className="animate-pulse">...</span> : l.allapot === "kesz" ? " ✓" : ""}</span>
            </div>
          );
        })}
        {lepesek.some(l => l.allapot === "folyamatban") && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-gray-600">[STATUS: </span>
            <span className="text-amber-400">IN PROGRESS</span>
            <span className="text-gray-600">]</span>
          </div>
        )}
        {lepesek.every(l => l.allapot === "kesz") && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-gray-600">[STATUS: </span>
            <span className="text-green-400">COMPLETED</span>
            <span className="text-gray-600">] — Operátori jóváhagyásra vár</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Integracio() {
  const [, setLocation] = useLocation();
  const [aktívPreset, setAktívPreset] = useState<DemoPreset>(DEMO_PRESETS[0]);
  const [aiAllapot, setAiAllapot] = useState<"idle" | "feldolgoz" | "kesz">("idle");
  const [workflowAllapot, setWorkflowAllapot] = useState<"idle" | "fut" | "jovahagyas" | "kesz">("idle");
  const [workflowLepesek, setWorkflowLepesek] = useState<WorkflowLepes[]>(WORKFLOW_LEPESEK_VISUAL);
  const [aktualisLepes, setAktualisLepes] = useState(-1);
  const [operatorDontes, setOperatorDontes] = useState<"" | "jovahagyva" | "visszakuld">(""); 
  const [copied, setCopied] = useState(false);
  const workflowRef = useRef<HTMLDivElement>(null);

  // Reset when preset changes
  useEffect(() => {
    setAiAllapot("idle");
    setWorkflowAllapot("idle");
    setAktualisLepes(-1);
    setOperatorDontes("");
    const lepesek = aktívPreset.rendszer === "klaes" ? WORKFLOW_LEPESEK_KLAES : WORKFLOW_LEPESEK_VISUAL;
    setWorkflowLepesek(lepesek.map(l => ({ ...l, allapot: "var" as const })));
  }, [aktívPreset]);

  const handleAiFeldolgozas = () => {
    setAiAllapot("feldolgoz");
    setTimeout(() => setAiAllapot("kesz"), 2200);
  };

  const handleWorkflowIndit = () => {
    if (workflowAllapot !== "idle") return;
    setWorkflowAllapot("fut");
    setAktualisLepes(0);
    workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const lepesek = aktívPreset.rendszer === "klaes" ? [...WORKFLOW_LEPESEK_KLAES] : [...WORKFLOW_LEPESEK_VISUAL];
    const frissit = (idx: number) => {
      setWorkflowLepesek(prev => prev.map((l, i) =>
        i < idx ? { ...l, allapot: "kesz" }
        : i === idx ? { ...l, allapot: "folyamatban" }
        : { ...l, allapot: "var" }
      ));
      setAktualisLepes(idx);
    };

    // Animate through steps 0-5 (stop before "Operátori jóváhagyás")
    for (let i = 0; i < 6; i++) {
      setTimeout(() => frissit(i), i * 900);
    }
    setTimeout(() => {
      setWorkflowLepesek(prev => prev.map((l, i) =>
        i < 6 ? { ...l, allapot: "kesz" }
        : i === 6 ? { ...l, allapot: "folyamatban" }
        : { ...l, allapot: "var" }
      ));
      setAktualisLepes(6);
      setWorkflowAllapot("jovahagyas");
    }, 6 * 900);
  };

  const handleJovahagyas = () => {
    setOperatorDontes("jovahagyva");
    setWorkflowLepesek(prev => prev.map(l => ({ ...l, allapot: "kesz" as const })));
    setWorkflowAllapot("kesz");
    toast.success("Ajánlat mentve a rendszerbe!");
  };

  const handleVisszakuld = () => {
    setOperatorDontes("visszakuld");
    toast.error("Visszaküldve javításra – az operátor megjegyzést fűzött hozzá.");
  };

  const handleReset = () => {
    setAiAllapot("idle");
    setWorkflowAllapot("idle");
    setAktualisLepes(-1);
    setOperatorDontes("");
    const lepesek = aktívPreset.rendszer === "klaes" ? WORKFLOW_LEPESEK_KLAES : WORKFLOW_LEPESEK_VISUAL;
    setWorkflowLepesek(lepesek.map(l => ({ ...l, allapot: "var" as const })));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(aktívPreset.input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const GREEN = "oklch(0.32 0.09 152)";
  const GREEN_LIGHT = "oklch(0.97 0.015 152)";

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Nyílászáró Ajánlat</span>
          </button>
          <div className="flex items-center gap-1">
            {[
              { label: "Landing", path: "/landing" },
              { label: "Demo", path: "/demo" },
              { label: "Integráció", path: "/integracio" },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  item.path === "/integracio"
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
                style={item.path === "/integracio" ? { background: GREEN } : {}}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "oklch(0.18 0.05 152)" }}>
        {/* Hero image background */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663484075883/FvhNQaASWDn62j9UMjwGNV/integracio-hero-dtH4eded4uywg2CSi8AmGE.webp"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border"
              style={{ color: "oklch(0.85 0.08 152)", borderColor: "oklch(0.40 0.09 152)", background: "oklch(0.25 0.06 152)" }}>
              <Zap className="w-3.5 h-3.5" />
              AI-assisted workflow — nem autonóm robot
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-[Figtree] mb-4">
              AI automatikus kitöltés<br />
              <span style={{ color: "oklch(0.80 0.12 80)" }}>Visual és Klaes</span> rendszerekhez
            </h1>
            <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-2xl">
              Strukturált adatokból gyors, ellenőrzött adatbevitel meglévő céges szoftverekbe — az operátor jóváhagyásával.
            </p>
            {/* Value points */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: <TrendingDown className="w-4 h-4" />, text: "Kevesebb kézi kattintás" },
                { icon: <Clock className="w-4 h-4" />, text: "Gyorsabb ajánlat-rögzítés" },
                { icon: <UserCheck className="w-4 h-4" />, text: "Operátori jóváhagyással" },
              ].map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
                  style={{ background: "oklch(0.28 0.07 152)", color: "oklch(0.88 0.06 152)" }}>
                  {v.icon}{v.text}
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => workflowRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                style={{ background: "oklch(0.55 0.14 80)" }}
              >
                <Play className="w-4 h-4" /> Működés megtekintése
              </button>
              <button
                onClick={() => setLocation("/demo")}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border transition-all hover:bg-white/10"
                style={{ borderColor: "oklch(0.45 0.09 152)", color: "oklch(0.88 0.06 152)" }}
              >
                Ajánlat-előkészítő <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DEMO PRESET BUTTONS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 mr-1">Demo betöltése:</span>
          {DEMO_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setAktívPreset(p)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                aktívPreset.id === p.id
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
              style={aktívPreset.id === p.id ? { background: GREEN } : {}}
            >
              {p.nev}
            </button>
          ))}
          <button onClick={handleReset} className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. HOGYAN MŰKÖDIK – TIMELINE
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GREEN }}>Folyamat</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[Figtree]">Hogyan működik?</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">Kontrollált, nyomon követhető, auditálható lépések — az ember a folyamat része marad</p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-16" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
              {[
                { n: 1, icon: <Database className="w-5 h-5" />, cim: "Bejövő igény", leiras: "Szabad szöveges felmérési adat érkezik az operátortól" },
                { n: 2, icon: <Zap className="w-5 h-5" />, cim: "AI értelmezés", leiras: "A rendszer azonosítja a kategóriát, méreteket, opciókat" },
                { n: 3, icon: <FileCheck className="w-5 h-5" />, cim: "Strukturált mezők", leiras: "Az adatok típusos, rendszer-kompatibilis formátumba kerülnek" },
                { n: 4, icon: <Shield className="w-5 h-5" />, cim: "Validáció", leiras: "Hiányzó és bizonytalan mezők automatikus jelzése" },
                { n: 5, icon: <Monitor className="w-5 h-5" />, cim: "Visual / Klaes kitöltés", leiras: "A rendszer automatikusan kitölti a meglévő szoftver mezőit" },
                { n: 6, icon: <UserCheck className="w-5 h-5" />, cim: "Operátori mentés", leiras: "Az operátor ellenőriz és jóváhagy — csak ezután kerül mentésre" },
              ].map((l, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-105"
                    style={{ background: i === 5 ? "oklch(0.55 0.14 80)" : i < 2 ? GREEN_LIGHT : "oklch(0.96 0.005 152)", color: i === 5 ? "white" : GREEN }}
                  >
                    {l.icon}
                  </div>
                  <div className="text-xs font-bold mb-1" style={{ color: GREEN }}>0{l.n}</div>
                  <div className="text-sm font-bold text-gray-800 font-[Figtree] mb-1">{l.cim}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{l.leiras}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. INPUT → STRUKTURÁLT ADAT DEMO
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GREEN }}>Demo</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[Figtree]">Input → Strukturált adat</h2>
            <p className="text-gray-500 mt-2">Szabad szöveges felmérési adatból automatikusan strukturált mezők</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: input */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-semibold text-gray-600">Bejövő felmérési szöveg</span>
                </div>
                <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Másolva" : "Másolás"}
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed font-mono bg-gray-50 rounded-lg p-4 border border-gray-100">
                  {aktívPreset.input}
                </p>
                <button
                  onClick={handleAiFeldolgozas}
                  disabled={aiAllapot === "feldolgoz"}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl text-white transition-all hover:brightness-95 disabled:opacity-60"
                  style={{ background: GREEN }}
                >
                  {aiAllapot === "feldolgoz" ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> AI feldolgozás folyamatban...</>
                  ) : aiAllapot === "kesz" ? (
                    <><CheckCircle2 className="w-4 h-4" /> Feldolgozva – újrafuttatás</>
                  ) : (
                    <><Zap className="w-4 h-4" /> AI feldolgozás szimulálása</>
                  )}
                </button>
              </div>
            </div>

            {/* Right: structured output */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${aiAllapot === "kesz" ? "bg-green-400" : "bg-gray-300"}`} />
                  <span className="text-xs font-semibold text-gray-600">Strukturált mezők</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> OK</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Figyelmeztetés</span>
                  <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> Hiányzik</span>
                </div>
              </div>
              <div className="p-5">
                {aiAllapot === "idle" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">Kattints az "AI feldolgozás szimulálása" gombra</p>
                  </div>
                ) : aiAllapot === "feldolgoz" ? (
                  <div className="space-y-2">
                    {aktívPreset.struktura.map((_, i) => (
                      <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aktívPreset.struktura.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all"
                        style={{
                          background: m.allapot === "ok" ? "oklch(0.98 0.005 152)" : m.allapot === "figyelmeztetes" ? "oklch(0.98 0.02 80)" : "oklch(0.98 0.01 20)",
                          borderColor: m.allapot === "ok" ? "oklch(0.88 0.04 152)" : m.allapot === "figyelmeztetes" ? "oklch(0.88 0.06 80)" : "oklch(0.88 0.04 20)",
                          animationDelay: `${i * 60}ms`,
                        }}
                      >
                        <span className="text-gray-500 font-medium w-32 flex-shrink-0">{m.cimke}</span>
                        <span className={`flex-1 font-semibold text-center ${m.allapot === "hianyzik" ? "text-red-500 italic" : "text-gray-800"}`}>
                          {m.ertek}
                        </span>
                        <AllapotJel allapot={m.allapot} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. AUTOMATION CONSOLE
      ══════════════════════════════════════════════════════════ */}
      <section ref={workflowRef} className="py-16 lg:py-20" id="automation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GREEN }}>Automation Console</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[Figtree]">Kitöltési folyamat</h2>
            <p className="text-gray-500 mt-2">Kontrollált, naplózható, auditálható — minden lépés látható</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: step cards */}
            <div className="space-y-2">
              {workflowLepesek.map((l, i) => (
                <div
                  key={l.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    l.allapot === "kesz" ? "border-green-200 bg-green-50"
                    : l.allapot === "folyamatban" ? "border-amber-300 bg-amber-50 shadow-sm"
                    : l.allapot === "hiba" ? "border-red-200 bg-red-50"
                    : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    l.allapot === "kesz" ? "bg-green-500 text-white"
                    : l.allapot === "folyamatban" ? "bg-amber-400 text-white animate-pulse"
                    : l.allapot === "hiba" ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-400"
                  }`}>
                    {l.allapot === "kesz" ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold ${l.allapot === "var" ? "text-gray-400" : "text-gray-800"}`}>{l.cim}</div>
                    <div className="text-xs text-gray-400 truncate">{l.leiras}</div>
                  </div>
                  {l.allapot === "folyamatban" && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin flex-shrink-0" />}
                </div>
              ))}
            </div>

            {/* Right: terminal log */}
            <div className="space-y-4">
              <WorkflowLog lepesek={workflowLepesek} rendszer={aktívPreset.rendszer === "klaes" ? "Klaes" : "Visual Window"} />

              {/* Control buttons */}
              {workflowAllapot === "idle" && (
                <button
                  onClick={handleWorkflowIndit}
                  disabled={aiAllapot !== "kesz"}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl text-white transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: GREEN }}
                >
                  <Play className="w-4 h-4" />
                  {aiAllapot !== "kesz" ? "Előbb futtasd az AI feldolgozást" : `${aktívPreset.rendszer === "klaes" ? "Klaes" : "Visual Window"} kitöltés indítása`}
                </button>
              )}
              {workflowAllapot === "fut" && (
                <div className="text-center text-sm text-amber-600 font-medium py-2 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Automatikus kitöltés folyamatban...
                </div>
              )}
              {workflowAllapot === "kesz" && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-green-800">Mentés kész</div>
                    <div className="text-xs text-green-600">Az ajánlat sikeresen rögzítve a rendszerben</div>
                  </div>
                  <button onClick={handleReset} className="ml-auto text-xs text-green-600 hover:text-green-800 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Újra
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* ══════════════════════════════════════════════════════════
          5. OPERATÓRI ELLENŐRZŐ PANEL
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GREEN }}>Operatóri kontroll</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[Figtree]">Az ember a folyamat része marad</h2>
            <p className="text-gray-500 mt-2">A rendszer nem ment vakon — minden művelet operatóri jóváhagyáshoz kötött</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Operator review panel */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" style={{ color: GREEN }} />
                  <span className="text-sm font-bold text-gray-800 font-[Figtree]">Operatóri ellenőrző panel</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: "oklch(0.97 0.02 80)", color: "oklch(0.55 0.14 80)" }}>
                  Jóváhagyásra vár
                </span>
              </div>
              <div className="p-5 space-y-3">
                {/* Fields summary */}
                {aktívPreset.struktura.map((m, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs border ${
                    m.allapot === "ok" ? "bg-green-50 border-green-100"
                    : m.allapot === "figyelmeztetes" ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
                  }`}>
                    <span className="text-gray-500 font-medium w-32 flex-shrink-0">{m.cimke}</span>
                    <span className={`flex-1 font-semibold ${
                      m.allapot === "hianyzik" ? "text-red-600 italic" : "text-gray-800"
                    }`}>{m.ertek}</span>
                    <AllapotJel allapot={m.allapot} />
                  </div>
                ))}
              </div>
              {/* Action buttons */}
              {operatorDontes === "" && workflowAllapot === "jovahagyas" && (
                <div className="px-5 pb-5 flex gap-3">
                  <button
                    onClick={handleJovahagyas}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl text-white transition-all hover:brightness-95"
                    style={{ background: GREEN }}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Jóváhagyás
                  </button>
                  <button
                    onClick={handleVisszakuld}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Visszaküldés
                  </button>
                </div>
              )}
              {operatorDontes === "jovahagyva" && (
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-bold text-green-800">Jóváhagyva — mentve</div>
                      <div className="text-xs text-green-600">Az ajánlat rögzítve a rendszerben</div>
                    </div>
                  </div>
                </div>
              )}
              {operatorDontes === "visszakuld" && (
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-sm font-bold text-red-800">Visszaküldve javításra</div>
                      <div className="text-xs text-red-600">Az operatór megjegyzést fűzött hozzá</div>
                    </div>
                  </div>
                </div>
              )}
              {workflowAllapot === "idle" && (
                <div className="px-5 pb-5">
                  <div className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-xl">
                    Indítsd el a workflow-t a panel aktiválásához
                  </div>
                </div>
              )}
            </div>

            {/* Right: explanation */}
            <div className="space-y-4">
              <div className="text-lg font-bold text-gray-900 font-[Figtree]">„Nem vakon ment” — az operatór mindig dönt</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A rendszer soha nem hajt végre mentést operatóri jóváhagyás nélkül. Minden automatikusan kitöltött mező látható, ellenőrizhető és szerkeszthető.
              </p>
              {[
                { icon: <Eye className="w-4 h-4" />, cim: "Teljes átláthatóság", szov: "Minden kitöltött mező látható és összehasonlítható az eredeti adattal" },
                { icon: <AlertTriangle className="w-4 h-4" />, cim: "Színkódos jelzések", szov: "Zöld = OK, Sárga = ellenőrizni kell, Piros = hiányzik — azonnal látható" },
                { icon: <Users className="w-4 h-4" />, cim: "Kézi szerkesztés", szov: "Az operatór bármely mezőt módosíthat jóváhagyás előtt" },
                { icon: <Lock className="w-4 h-4" />, cim: "Mentés csak jóváhagyás után", szov: "A Visual / Klaes rendszerbe való rögzítés csak explicit jóváhagyás után történik" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: GREEN_LIGHT, color: GREEN }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{item.cim}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.szov}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. INTEGRÁCIÓS MÓDOK
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GREEN }}>Technikai megoldások</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[Figtree]">Integrációs módok</h2>
            <p className="text-gray-500 mt-2">Négy megközelítés — MVP-ben a legjobb út kiemelve</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                cim: "Import / Export",
                ikon: <Database className="w-5 h-5" />,
                mikor: "Amikor a rendszer támogat CSV/XML importot",
                elony: "Egyszerű, stabil, nem függ a UI-tól",
                stabilitas: "Magas",
                mvp: false,
                szin: "gray",
              },
              {
                cim: "UI Automation",
                ikon: <Monitor className="w-5 h-5" />,
                mikor: "Amikor nincs API, de a UI hozzáférhető",
                elony: "Teljes automatizálás, nincs kézi beavatkozás",
                stabilitas: "Közepes (UI-változás érzékeny)",
                mvp: false,
                szin: "gray",
              },
              {
                cim: "AI Computer Use",
                ikon: <Zap className="w-5 h-5" />,
                mikor: "Komplex, változó képernyők esetén",
                elony: "Rugalmas, emberi módon használja a szoftvert",
                stabilitas: "Fejlődőben (2024-2025)",
                mvp: false,
                szin: "gray",
              },
              {
                cim: "Operatóri Handoff",
                ikon: <UserCheck className="w-5 h-5" />,
                mikor: "MVP fázisban, ahol a kontroll fontos",
                elony: "Azonnali ROI, minimalis kockázat, emberi ellenőrzés",
                stabilitas: "Magas — az ember dönt",
                mvp: true,
                szin: "green",
              },
            ].map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all ${
                  m.mvp ? "shadow-lg" : "border-gray-100"
                }`}
                style={m.mvp ? { borderColor: GREEN, background: GREEN_LIGHT } : {}}
              >
                {m.mvp && (
                  <div className="text-xs font-bold px-2.5 py-1 rounded-full self-start text-white" style={{ background: GREEN }}>
                    ★ MVP-ben ajánlott
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: m.mvp ? GREEN : "oklch(0.94 0 0)", color: m.mvp ? "white" : "oklch(0.5 0 0)" }}>
                    {m.ikon}
                  </div>
                  <div className="text-sm font-bold text-gray-800 font-[Figtree]">{m.cim}</div>
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div><span className="font-semibold text-gray-700">Mikor jó:</span> {m.mikor}</div>
                  <div><span className="font-semibold text-gray-700">Előny:</span> {m.elony}</div>
                  <div><span className="font-semibold text-gray-700">Stabilitás:</span> {m.stabilitas}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 rounded-xl px-6 py-4 border border-gray-200">
            <strong className="text-gray-700">MVP-ben a legjobb út:</strong> Strukturált adatok + félautomata kitöltés operatóri jóváhagyással — nem teljes autónóm robot.
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. ROI BLOKK
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20" style={{ background: "oklch(0.18 0.05 152)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "oklch(0.80 0.12 80)" }}>ROI</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-[Figtree]">Mérhető üzleti érték</h2>
            <p className="mt-2" style={{ color: "oklch(0.70 0.04 152)" }}>Demo számok — valós implementáció után mérhető</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { kor: "30–60 perc", utan: "5–15 perc", cim: "Ajánlatrögzítés idő", szov: "Előkészítés + gyors feltöltés, nem kell végigkattintani minden mezőt" },
              { kor: "~15-20%", utan: "<5%", cim: "Hiányzó mezők aránya", szov: "Automatikus validáció jelzi a hiányosságokat még rögzítés előtt" },
              { kor: "Kézi", utan: "Félautomata", cim: "Adminisztráció jellege", szov: "Ismétlődő kézi munka helyett az operatór az ellenőrzésre fókuszálhat" },
            ].map((r, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: "oklch(0.25 0.06 152)" }}>
                <div className="text-xs font-bold mb-3" style={{ color: "oklch(0.80 0.12 80)" }}>{r.cim}</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "oklch(0.60 0.04 152)" }}>Korábban</div>
                    <div className="text-xl font-bold text-white/60 line-through font-[Figtree]">{r.kor}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.80 0.12 80)" }} />
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "oklch(0.60 0.04 152)" }}>AI-val</div>
                    <div className="text-xl font-bold text-white font-[Figtree]">{r.utan}</div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.65 0.04 152)" }}>{r.szov}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. KOCKÁZATOK ÉS KONTROLL
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GREEN }}>Biztonság</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[Figtree] mb-4">Miért működik biztonságosan?</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                A rendszer nem egy „feketedoboz AI”. Minden lépés naplózott, visszakövethető, és az operatór bármikor beavatkozhat.
              </p>
              <div className="space-y-3">
                {[
                  { ikon: <Users className="w-4 h-4" />, cim: "Human-in-the-loop", szov: "Az ember minden mentési döntésben részt vesz" },
                  { ikon: <Shield className="w-4 h-4" />, cim: "Validáció mentés előtt", szov: "Kötelező mezők és logikai ellenőrzések automatikusan futnak" },
                  { ikon: <Eye className="w-4 h-4" />, cim: "Naplózható lépések", szov: "Minden automatikus művelet időbélyeggel rögzített" },
                  { ikon: <RotateCcw className="w-4 h-4" />, cim: "Kézi fallback", szov: "Bármikor átvehető kézi módba, semmi nem záródik be" },
                  { ikon: <ChevronRight className="w-4 h-4" />, cim: "Fokozatos bevezetés", szov: "Először standard use case-ek, majd fokozatos bővítés" },
                  { ikon: <CheckCircle2 className="w-4 h-4" />, cim: "Auditható folyamat", szov: "Minden döntés visszakövethető, ki és mikor hajtotta végre" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: GREEN_LIGHT, color: GREEN }}>
                      {item.ikon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{item.cim}</div>
                      <div className="text-xs text-gray-500">{item.szov}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663484075883/FvhNQaASWDn62j9UMjwGNV/integracio-console-KE2SQSCCA97Cb7jtA9Tpmz.webp"
                alt="Automation console monitor"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. ZÁRÓ CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: "oklch(0.22 0.06 152)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "oklch(0.80 0.12 80)" }}>Következő lépés</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[Figtree] mb-4 leading-tight">
            AI a meglevő rendszered köré —<br />
            <span style={{ color: "oklch(0.80 0.12 80)" }}>nem a helyére</span>
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "oklch(0.70 0.04 152)" }}>
            A legjobb ROI ott van, ahol a meglevő Visual vagy Klaes workflow marad, de az adatbevitel és ajánlatrögzítés jelentősen gyorsul.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => document.getElementById("automation")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3.5 rounded-xl text-white shadow-lg transition-all hover:brightness-110"
              style={{ background: "oklch(0.55 0.14 80)" }}
            >
              <Play className="w-4 h-4" /> Pilot workflow megnézése
            </button>
            <button
              onClick={() => setLocation("/demo")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl border transition-all hover:bg-white/10"
              style={{ borderColor: "oklch(0.45 0.09 152)", color: "oklch(0.88 0.06 152)" }}
            >
              Ajánlat-előkészítő modul <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-gray-400">Nyílászáró Ajánlat-előkészítő — Demo rendszer</div>
          <div className="flex gap-4">
            {[
              { label: "Főoldal", path: "/" },
              { label: "Landing", path: "/landing" },
              { label: "Demo", path: "/demo" },
            ].map(item => (
              <button key={item.path} onClick={() => setLocation(item.path)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── SECOND HALF – appended sections ─────────────────────────────────────────
// This file is split for readability. The export default above renders the full page
// including the sections below via the IntegracioSections component.
