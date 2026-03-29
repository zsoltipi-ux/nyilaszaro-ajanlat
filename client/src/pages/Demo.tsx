/*
 * Demo.tsx – AjánlatAI 3-step demo flow
 * Design: Clean SaaS tool, dark green accents, amber CTAs
 * Steps: 1. Bejövő igény → 2. Strukturált tételek → 3. Operátori handoff
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Printer,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Home,
  Zap,
  FileText,
  Send,
  LayoutList,
  Clock,
  Download,
  ShieldCheck,
  XCircle,
  Info,
  MonitorCheck,
} from "lucide-react";
import { parseHungarianText } from "@/lib/parser";
import {
  generateOperatoriOsszesito,
  generateUgyfelEmail,
  generateNyomtathatoAjanlat,
  validateAjanlatAdatok,
} from "@/lib/kimenet";
import {
  validateForExport,
  generateVisualWindowExport,
  generateKlaesCSV,
  downloadFile,
  generateFilename,
} from "@/lib/export";
import type { AjanlatAdatok, Tetel, UgyfelAdatok, AjanlatStatusz } from "@/lib/types";
import {
  URES_UGYFEL,
  URES_PROJEKT,
  URES_TETEL,
  KATEGORIA_CIMKEK,
  PROFIL_CIMKEK,
  NYITAS_MOD_CIMKEK,
  NYITAS_IRANY_CIMKEK,
  UVEGEZÉS_CIMKEK,
  KAPCSOLAT_TIPUS_CIMKEK,
} from "@/lib/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── SAMPLE DATA ───────────────────────────────────────────────────────────

const MINTAK: Record<string, { ugyfel: Partial<UgyfelAdatok>; szoveg: string; projektNev: string }> = {
  csaladi_haz: {
    ugyfel: {
      nev: "Kovács István",
      telefon: "+36 30 123 4567",
      email: "kovacs.istvan@email.hu",
      helyszin: "1234 Budapest, Rózsa utca 12.",
      megjegyzes: "Felújítás, régi fa ablakok cseréje",
    },
    projektNev: "Kovács – Rózsa utca felújítás",
    szoveg:
      "4 db 120x150 bukó-nyíló jobb fehér Rehau ablak 3 rétegű üveggel, redőnnyel, szúnyoghálóval\n2 db 60x90 bukó-nyíló bal fehér Rehau ablak 3 rétegű üveggel\n1 db erkélyajtó 90x210 bukó-nyíló bal fehér Rehau 3 rétegű üveg redőnnyel szúnyoghálóval\n1 db bejárati ajtó 100x210 antracit balos nyitás biztonsági üveg",
  },
  erkelyajto: {
    ugyfel: {
      nev: "Nagy Éva",
      telefon: "+36 20 987 6543",
      email: "nagy.eva@gmail.com",
      helyszin: "9700 Szombathely, Kossuth tér 5. 3/8.",
      megjegyzes: "Panellakás, erkélyre nyíló ajtó csere",
    },
    projektNev: "Nagy – erkélyajtó csere",
    szoveg:
      "1 db erkélyajtó 90x215 bukó-nyíló jobb fehér Gealan 3 rétegű üveg szúnyoghálóval\n1 db redőny 90x215 fehér",
  },
  bejarat: {
    ugyfel: {
      nev: "Tóth Péter",
      telefon: "+36 70 555 1234",
      email: "toth.peter@ceg.hu",
      helyszin: "4025 Debrecen, Piac utca 88.",
      megjegyzes: "Irodaépület bejárata, biztonsági igény",
    },
    projektNev: "Tóth – irodaépület bejárat",
    szoveg:
      "1 db bejárati ajtó 120x220 antracit jobb nyitás biztonsági üveg elektromos zár könyöklővel\n3 db ablak 80x120 bukó-nyíló jobb antracit Rehau 3 rétegű üveg",
  },
  komplex: {
    ugyfel: {
      nev: "Molnár Kft.",
      telefon: "+36 1 234 5678",
      email: "iroda@molnar-kft.hu",
      helyszin: "1117 Budapest, Irinyi József utca 4-20.",
      megjegyzes: "Irodaépület teljes felújítás, 2. emelet",
    },
    projektNev: "Molnár Kft. – irodaépület 2. emelet",
    szoveg:
      "4 db 140x160 fix fehér Rehau ablak 3 rétegű üveggel\n4 db 100x160 bukó-nyíló jobb fehér Rehau ablak 3 rétegű üveggel redőnnyel\n2 db erkélyajtó 90x210 bukó-nyíló bal antracit Rehau 3 rétegű üveg szúnyoghálóval\n1 db bejárati ajtó 120x220 antracit jobb biztonsági üveg\n1 db tolóajtó 200x210 antracit Rehau 3 rétegű üveg",
  },
};

// ─── HELPERS ───────────────────────────────────────────────────────────────

const INITIAL: AjanlatAdatok = {
  ugyfel: { ...URES_UGYFEL },
  projekt: { ...URES_PROJEKT },
  tetelek: [],
  statusz: "piszkazat",
  letrehozva: new Date().toISOString(),
  modositva: new Date().toISOString(),
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 bg-white transition-colors"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder = "Válassz...",
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}

function TetelStatusz({ tetel }: { tetel: Tetel }) {
  const hasError = !tetel.kategoria || !tetel.szelesseg || !tetel.magassag;
  const hasWarning = !tetel.nyitasMod || !tetel.szin;
  if (hasError) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
      <AlertCircle className="w-3 h-3" /> Hiányos
    </span>
  );
  if (hasWarning) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      <AlertTriangle className="w-3 h-3" /> Ellenőrizendő
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <CheckCircle2 className="w-3 h-3" /> Feldolgozott
    </span>
  );
}

const SZIN_OPTIONS: [string, string][] = [
  ["Fehér", "Fehér"], ["Antracit", "Antracit"], ["Barna", "Barna"],
  ["Arany tölgy", "Arany tölgy"], ["Tölgy", "Tölgy"], ["Dió", "Dió"],
  ["Szürke", "Szürke"], ["Fekete", "Fekete"], ["Golden oak", "Golden oak"],
  ["Winchester", "Winchester"], ["Egyéb", "Egyéb"],
];

function TetelCard({
  tetel,
  index,
  onChange,
  onDelete,
  onCopy,
}: {
  tetel: Tetel;
  index: number;
  onChange: (t: Tetel) => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const [open, setOpen] = useState(true);
  const up = (f: keyof Tetel, v: unknown) => onChange({ ...tetel, [f]: v });
  const kat = tetel.kategoria ? KATEGORIA_CIMKEK[tetel.kategoria as keyof typeof KATEGORIA_CIMKEK] || tetel.kategoria : "Nincs kategória";
  const meret = tetel.szelesseg && tetel.magassag ? `${tetel.szelesseg}×${tetel.magassag} mm` : "méret hiányzik";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold flex-shrink-0" style={{ background: "oklch(0.32 0.09 152)" }}>
            {index}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 font-[Figtree]">{kat}</span>
              <TetelStatusz tetel={tetel} />
            </div>
            <div className="text-xs text-gray-500">{tetel.darabszam || 1} db · {meret}{tetel.szin ? ` · ${tetel.szin}` : ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onCopy(); }} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Másolás">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Törlés">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div><Label required>Kategória</Label><Select value={tetel.kategoria} onChange={(v) => up("kategoria", v)} options={Object.entries(KATEGORIA_CIMKEK)} placeholder="Kategória..." /></div>
            <div><Label>Profilrendszer</Label><Select value={tetel.profilRendszer} onChange={(v) => up("profilRendszer", v)} options={Object.entries(PROFIL_CIMKEK)} placeholder="Profil..." /></div>
            <div><Label>Darabszám</Label><Input type="number" value={tetel.darabszam} onChange={(v) => up("darabszam", v)} placeholder="1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label required>Szélesség (mm)</Label><Input type="number" value={tetel.szelesseg} onChange={(v) => up("szelesseg", v)} placeholder="pl. 1200" /></div>
            <div><Label required>Magasság (mm)</Label><Input type="number" value={tetel.magassag} onChange={(v) => up("magassag", v)} placeholder="pl. 1500" /></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div><Label>Nyitásmód</Label><Select value={tetel.nyitasMod} onChange={(v) => up("nyitasMod", v)} options={Object.entries(NYITAS_MOD_CIMKEK)} placeholder="Nyitásmód..." /></div>
            <div><Label>Nyitásirány</Label><Select value={tetel.nyitasIrany} onChange={(v) => up("nyitasIrany", v)} options={Object.entries(NYITAS_IRANY_CIMKEK)} placeholder="Irány..." /></div>
            <div><Label>Szín</Label><Select value={tetel.szin} onChange={(v) => up("szin", v)} options={SZIN_OPTIONS} placeholder="Szín..." /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Üvegezés</Label><Select value={tetel.uvegezés} onChange={(v) => up("uvegezés", v)} options={Object.entries(UVEGEZÉS_CIMKEK)} placeholder="Üvegezés..." /></div>
            <div><Label>Egyéb kiegészítők</Label><Input value={tetel.egyebKiegeszitok} onChange={(v) => up("egyebKiegeszitok", v)} placeholder="pl. biztonsági zár..." /></div>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            {[["parkany", "Párkány"], ["redony", "Redőny"], ["szunyoghalo", "Szúnyogháló"]].map(([f, l]) => (
              <label key={f} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={tetel[f as keyof Tetel] as boolean} onChange={(e) => up(f as keyof Tetel, e.target.checked)} className="rounded border-gray-300 w-3.5 h-3.5" />
                <span className="text-xs text-gray-600">{l}</span>
              </label>
            ))}
          </div>
          <div>
            <Label>Belső megjegyzés</Label>
            <textarea value={tetel.belsomegjegyzes} onChange={(e) => up("belsomegjegyzes", e.target.value)} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 bg-white resize-none" placeholder="Megjegyzés..." />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP INDICATOR ────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: "Bejövő igény", icon: <Zap className="w-3.5 h-3.5" /> },
    { num: 2, label: "Strukturált tételek", icon: <LayoutList className="w-3.5 h-3.5" /> },
    { num: 3, label: "Operátori handoff", icon: <FileText className="w-3.5 h-3.5" /> },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${step === s.num ? "bg-white shadow-sm" : "opacity-50"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.num ? "text-white" : "bg-gray-200 text-gray-500"}`} style={step >= s.num ? { background: "oklch(0.32 0.09 152)" } : {}}>
              {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === s.num ? "text-gray-800" : "text-gray-500"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className="w-6 h-px bg-gray-200 flex-shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── COPY BUTTON ───────────────────────────────────────────────────────────

function CopyBtn({ text, label = "Másolás" }: { text: string; label?: string }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); toast.success("Vágólapra másolva!"); }
    catch { toast.error("Másolás sikertelen"); }
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
      <Copy className="w-3.5 h-3.5" />{label}
    </button>
  );
}

// ─── MAIN DEMO PAGE ────────────────────────────────────────────────────────

export default function Demo() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [ajanlat, setAjanlat] = useLocalStorage<AjanlatAdatok>("ajanlat-demo-v1", INITIAL);
  const [szabadSzoveg, setSzabadSzoveg] = useState("");
  const [processing, setProcessing] = useState(false);
  const [outputTab, setOutputTab] = useState<"operator" | "email" | "print">("operator");

  // Load sample from sessionStorage if set
  useEffect(() => {
    const sampleId = sessionStorage.getItem("demo_sample");
    if (sampleId && MINTAK[sampleId]) {
      const m = MINTAK[sampleId];
      setAjanlat({
        ...INITIAL,
        ugyfel: { ...URES_UGYFEL, ...m.ugyfel },
        projekt: { ...URES_PROJEKT, nev: m.projektNev, kapcsolatTipus: "bejovo_erdeklodes" },
        tetelek: [],
        letrehozva: new Date().toISOString(),
        modositva: new Date().toISOString(),
      });
      setSzabadSzoveg(m.szoveg);
      sessionStorage.removeItem("demo_sample");
      toast.success("Mintaadatok betöltve!");
    }
  }, []);

  const loadMinta = (id: string) => {
    const m = MINTAK[id];
    if (!m) return;
    setAjanlat({
      ...INITIAL,
      ugyfel: { ...URES_UGYFEL, ...m.ugyfel },
      projekt: { ...URES_PROJEKT, nev: m.projektNev, kapcsolatTipus: "bejovo_erdeklodes" },
      tetelek: [],
      letrehozva: new Date().toISOString(),
      modositva: new Date().toISOString(),
    });
    setSzabadSzoveg(m.szoveg);
    toast.success("Mintaadatok betöltve!");
  };

  const upUgyfel = (f: keyof UgyfelAdatok, v: string) =>
    setAjanlat((p) => ({ ...p, ugyfel: { ...p.ugyfel, [f]: v }, modositva: new Date().toISOString() }));

  const upProjekt = (f: string, v: string) =>
    setAjanlat((p) => ({ ...p, projekt: { ...p.projekt, [f]: v }, modositva: new Date().toISOString() }));

  const feldolgoz = useCallback(() => {
    if (!szabadSzoveg.trim()) { toast.error("Írjon be szöveget!"); return; }
    setProcessing(true);
    setTimeout(() => {
      const parsed = parseHungarianText(szabadSzoveg);
      if (!parsed.length) { toast.error("Nem sikerült tételeket felismerni"); setProcessing(false); return; }
      setAjanlat((p) => ({
        ...p,
        tetelek: [...p.tetelek, ...parsed],
        statusz: "ellenorzesre_var",
        modositva: new Date().toISOString(),
      }));
      setSzabadSzoveg("");
      setProcessing(false);
      toast.success(`${parsed.length} tétel felismerve – kérjük ellenőrizze!`);
      setStep(2);
    }, 900);
  }, [szabadSzoveg, setAjanlat]);

  const addTetel = () => {
    setAjanlat((p) => ({
      ...p,
      tetelek: [...p.tetelek, { id: nanoid(), ...URES_TETEL }],
      modositva: new Date().toISOString(),
    }));
  };

  const upTetel = (id: string, t: Tetel) =>
    setAjanlat((p) => ({ ...p, tetelek: p.tetelek.map((x) => (x.id === id ? t : x)), modositva: new Date().toISOString() }));

  const delTetel = (id: string) => {
    setAjanlat((p) => ({ ...p, tetelek: p.tetelek.filter((x) => x.id !== id), modositva: new Date().toISOString() }));
    toast.success("Tétel törölve");
  };

  const copyTetel = (t: Tetel) => {
    setAjanlat((p) => ({ ...p, tetelek: [...p.tetelek, { ...t, id: nanoid() }], modositva: new Date().toISOString() }));
    toast.success("Tétel másolva");
  };

  const hibak = validateAjanlatAdatok(ajanlat);
  const osszesDarab = ajanlat.tetelek.reduce((s, t) => s + parseInt(t.darabszam || "1", 10), 0);
  const operatoriSzoveg = generateOperatoriOsszesito(ajanlat);
  const emailSzoveg = generateUgyfelEmail(ajanlat);
  const nyomtathatoSzoveg = generateNyomtathatoAjanlat(ajanlat);

  // Export validation
  const exportValidation = validateForExport(ajanlat);
  const vwSzoveg = generateVisualWindowExport(ajanlat);

  const handleVWCopy = async () => {
    try {
      await navigator.clipboard.writeText(vwSzoveg);
      toast.success("Visual Window összesítő vágólapra másolva!");
    } catch {
      toast.error("Másolás sikertelen");
    }
  };

  const handleKlaesDownload = () => {
    const csv = generateKlaesCSV(ajanlat);
    const filename = generateFilename(ajanlat, "klaes", "csv");
    downloadFile(csv, filename, "text/csv");
    toast.success(`Klaes CSV letöltve: ${filename}`);
  };

  const handleVWDownload = () => {
    const filename = generateFilename(ajanlat, "visual-window", "txt");
    downloadFile(vwSzoveg, filename, "text/plain");
    toast.success(`Visual Window összesítő letöltve: ${filename}`);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>Ajánlat</title><style>body{font-family:monospace;font-size:12px;padding:20px;white-space:pre-wrap;}</style></head><body>${nyomtathatoSzoveg}</body></html>`);
      w.document.close(); w.print();
    }
  };

  const resetDemo = () => {
    if (window.confirm("Biztosan törli az összes adatot?")) {
      setAjanlat(INITIAL); setSzabadSzoveg(""); setStep(1);
      toast.success("Demo törölve");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.005 152)" }}>

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/landing")} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "oklch(0.32 0.09 152)" }}>AI</div>
              <span className="font-bold text-gray-900 font-[Figtree] text-sm hidden sm:block">AjánlatAI</span>
              <span className="text-xs text-gray-400 hidden sm:block">· Demo</span>
            </div>
          </div>

          <StepIndicator step={step} />

          <div className="flex items-center gap-2">
            <button onClick={resetDemo} className="text-xs text-gray-400 hover:text-red-500 transition-colors hidden sm:block">Törlés</button>
            <button onClick={() => setLocation("/")} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Home className="w-3.5 h-3.5" /> Eszköz
            </button>
          </div>
        </div>
      </header>

      {/* ─── SAMPLE BUTTONS BAR ─── */}
      <div className="bg-white border-b border-gray-100 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 flex-shrink-0">Minták:</span>
          {[
            { id: "csaladi_haz", label: "🏠 Családi ház" },
            { id: "erkelyajto", label: "🚪 Erkélyajtó" },
            { id: "bejarat", label: "🔑 Bejárati ajtó" },
            { id: "komplex", label: "🏗️ Komplex" },
          ].map((m) => (
            <button key={m.id} onClick={() => loadMinta(m.id)} className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-800 transition-colors">
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ══════════════════════════════════════════════════════════
            STEP 1 – BEJÖVŐ IGÉNY
        ══════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-[Figtree]">1. lépés – Bejövő igény rögzítése</h1>
              <p className="text-sm text-gray-500 mt-1">Töltsd ki az ügyfél adatait, majd írd be az igényt szabad szövegként</p>
            </div>

            {/* Ügyfél adatok */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm" style={{ borderLeft: "4px solid oklch(0.32 0.09 152)" }}>
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 font-[Figtree]">Ügyfél adatok</h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label required>Ügyfél neve</Label><Input value={ajanlat.ugyfel.nev} onChange={(v) => upUgyfel("nev", v)} placeholder="pl. Kovács István" /></div>
                <div><Label>Telefonszám</Label><Input type="tel" value={ajanlat.ugyfel.telefon} onChange={(v) => upUgyfel("telefon", v)} placeholder="+36 30 123 4567" /></div>
                <div><Label>Email</Label><Input type="email" value={ajanlat.ugyfel.email} onChange={(v) => upUgyfel("email", v)} placeholder="pelda@email.hu" /></div>
                <div><Label>Helyszín / cím</Label><Input value={ajanlat.ugyfel.helyszin} onChange={(v) => upUgyfel("helyszin", v)} placeholder="1234 Budapest, Példa utca 1." /></div>
                <div className="sm:col-span-2">
                  <Label>Projekt neve</Label>
                  <Input value={ajanlat.projekt.nev} onChange={(v) => upProjekt("nev", v)} placeholder="pl. Kovács – Rózsa utca felújítás" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Megjegyzés</Label>
                  <textarea value={ajanlat.ugyfel.megjegyzes} onChange={(e) => upUgyfel("megjegyzes", e.target.value)} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 bg-white resize-none" placeholder="Ügyfélhez kapcsolódó megjegyzés..." />
                </div>
              </div>
            </div>

            {/* Szabad szöveg */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm" style={{ borderLeft: "4px solid oklch(0.72 0.15 75)" }}>
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-gray-800 font-[Figtree]">Szabad szöveges igény</h2>
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full ml-auto">AI feldolgozás</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                <textarea
                  value={szabadSzoveg}
                  onChange={(e) => setSzabadSzoveg(e.target.value)}
                  rows={6}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 bg-white resize-none font-mono"
                  placeholder={"Példák:\n2 db 120x150 bukó-nyíló jobb fehér Rehau ablak 3 rétegű üveggel, redőnnyel\nbejárati ajtó antracit 100x210, balos nyitás\nerkélyajtó 90x210, bukó-nyíló, szúnyoghálóval"}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">Felismeri: darabszám, méretek, kategória, nyitásmód, irány, szín, profil, üvegezés, kiegészítők</p>
                  <button
                    onClick={feldolgoz}
                    disabled={processing}
                    className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-gray-900 transition-all hover:brightness-95 active:scale-95 disabled:opacity-60"
                    style={{ background: "oklch(0.80 0.15 80)" }}
                  >
                    {processing ? <Clock className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {processing ? "Feldolgozás..." : "AI feldolgozás"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:brightness-95"
                style={{ background: "oklch(0.32 0.09 152)" }}
              >
                Tovább: Tételek ellenőrzése <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 2 – STRUKTURÁLT TÉTELEK
        ══════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-[Figtree]">2. lépés – Strukturált tételek</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {ajanlat.tetelek.length} tétel rögzítve · {osszesDarab} db összesen · Ellenőrizd és szerkeszd a tételeket
                </p>
              </div>
              <div className="flex gap-2">
                {hibak.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    <AlertTriangle className="w-3 h-3" /> {hibak.length} figyelmeztetés
                  </span>
                )}
              </div>
            </div>

            {/* Validation warnings */}
            {hibak.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Hiányzó adatok</span>
                </div>
                <ul className="space-y-0.5">
                  {hibak.map((h, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />{h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Items */}
            <div className="space-y-3">
              {ajanlat.tetelek.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <LayoutList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">Még nincsenek tételek</p>
                  <p className="text-xs text-gray-300 mt-1">Menj vissza és dolgozd fel a szabad szöveget, vagy adj hozzá tételt kézzel</p>
                </div>
              ) : (
                ajanlat.tetelek.map((t, i) => (
                  <TetelCard key={t.id} tetel={t} index={i + 1}
                    onChange={(nt) => upTetel(t.id, nt)}
                    onDelete={() => delTetel(t.id)}
                    onCopy={() => copyTetel(t)}
                  />
                ))
              )}
              <button onClick={addTetel} className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-700 hover:bg-green-50/50 transition-all">
                <Plus className="w-4 h-4" /> Új tétel hozzáadása
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Vissza
              </button>
              <button onClick={() => setStep(3)} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:brightness-95" style={{ background: "oklch(0.32 0.09 152)" }}>
                Tovább: Operátori handoff <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 3 – OPERÁTORI HANDOFF
        ══════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-[Figtree]">3. lépés – Operátori handoff</h1>
              <p className="text-sm text-gray-500 mt-1">Összesítő, email vázlat és nyomtatható ajánlat – másolható, azonnal használható</p>
            </div>

            {/* Quick summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Ügyfél", val: ajanlat.ugyfel.nev || "–", sub: ajanlat.ugyfel.telefon || ajanlat.ugyfel.email || "Nincs elérhetőség" },
                { label: "Projekt", val: ajanlat.projekt.nev || "–", sub: ajanlat.projekt.hataridoSurgosseg || "Nincs határidő" },
                { label: "Tételek", val: `${ajanlat.tetelek.length} féle`, sub: `${osszesDarab} db összesen` },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                  <div className="text-sm font-bold text-gray-800 font-[Figtree]">{s.val}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ══ EXPORT VALIDATION PANEL ══ */}
            <div className={`rounded-xl border-2 shadow-sm overflow-hidden ${
              exportValidation.exportable
                ? "border-green-300 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}>
              {/* Header */}
              <div className={`px-5 py-3.5 flex items-center justify-between border-b ${
                exportValidation.exportable ? "border-green-200 bg-green-100/60" : "border-red-200 bg-red-100/60"
              }`}>
                <div className="flex items-center gap-2.5">
                  {exportValidation.exportable ? (
                    <ShieldCheck className="w-5 h-5 text-green-700" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className={`text-sm font-bold font-[Figtree] ${
                      exportValidation.exportable ? "text-green-800" : "text-red-800"
                    }`}>
                      {exportValidation.exportable
                        ? "Exportálható – minden kötelező adat megvan"
                        : `Nem exportálható – ${exportValidation.errors.length} hiba javítandó`}
                    </div>
                    <div className={`text-xs mt-0.5 ${
                      exportValidation.exportable ? "text-green-600" : "text-red-600"
                    }`}>
                      Adatminőség: {exportValidation.score}/100
                      {exportValidation.warnings.length > 0 && ` · ${exportValidation.warnings.length} figyelmeztetés`}
                    </div>
                  </div>
                </div>
                {/* Score bar */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-white/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        exportValidation.score >= 80 ? "bg-green-500" :
                        exportValidation.score >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${exportValidation.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${
                    exportValidation.score >= 80 ? "text-green-700" :
                    exportValidation.score >= 50 ? "text-amber-700" : "text-red-700"
                  }`}>{exportValidation.score}%</span>
                </div>
              </div>

              {/* Errors */}
              {exportValidation.errors.length > 0 && (
                <div className="px-5 py-3 space-y-1.5 border-b border-red-200">
                  <div className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Hibák (exportálás előtt javítandó)
                  </div>
                  {exportValidation.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                      {e.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {exportValidation.warnings.length > 0 && (
                <div className="px-5 py-3 space-y-1.5 border-b border-amber-200/60">
                  <div className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Figyelmeztetések (ajánlott ellenőrizni)
                  </div>
                  {exportValidation.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1" />
                      {w.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Export buttons */}
              <div className="px-5 py-4">
                <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                  <MonitorCheck className="w-3.5 h-3.5" /> Rendszer-export
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Visual Window */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "oklch(0.32 0.09 152)" }}>VW</div>
                      <div>
                        <div className="text-xs font-bold text-gray-800 font-[Figtree]">Visual Window</div>
                        <div className="text-xs text-gray-400">Strukturált beviteli összesítő</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                      A Visual Window manuális beviteli sorrendjének megfelelő, tételenkénti összesítő. Másolható vagy letölthető.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleVWCopy}
                        disabled={!exportValidation.exportable}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={exportValidation.exportable ? { borderColor: "oklch(0.32 0.09 152)", color: "oklch(0.32 0.09 152)", background: "oklch(0.97 0.005 152)" } : {}}
                      >
                        <Copy className="w-3.5 h-3.5" /> Másolás
                      </button>
                      <button
                        onClick={handleVWDownload}
                        disabled={!exportValidation.exportable}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={exportValidation.exportable ? { background: "oklch(0.32 0.09 152)" } : { background: "oklch(0.7 0 0)" }}
                      >
                        <Download className="w-3.5 h-3.5" /> .txt letöltés
                      </button>
                    </div>
                  </div>

                  {/* Klaes */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "oklch(0.30 0.08 260)" }}>KL</div>
                      <div>
                        <div className="text-xs font-bold text-gray-800 font-[Figtree]">Klaes</div>
                        <div className="text-xs text-gray-400">CSV import formátum</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                      Klaes-kompatibilis CSV fájl (;-elválasztó, UTF-8 BOM) a standard oszlopsorrendben. Importálható a Klaes rendszerbe.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleKlaesDownload}
                        disabled={!exportValidation.exportable}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={exportValidation.exportable ? { background: "oklch(0.30 0.08 260)" } : { background: "oklch(0.7 0 0)" }}
                      >
                        <Download className="w-3.5 h-3.5" /> .csv letöltés
                      </button>
                    </div>
                  </div>
                </div>

                {!exportValidation.exportable && (
                  <div className="mt-3 flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <Info className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      Az export gombok inaktívak, amíg a fenti hibák nem kerülnek javításra. Menj vissza a 2. lépésre és töltsd ki a hiányzó mezőket.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Output tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-700" />
                <h2 className="text-sm font-semibold text-gray-800 font-[Figtree]">Egyéb kimenetek</h2>
              </div>

              {/* Tab bar */}
              <div className="flex gap-1 bg-gray-50 border-b border-gray-100 px-4 py-2">
                {[
                  { id: "operator" as const, label: "Operátori összesítő", icon: <LayoutList className="w-3.5 h-3.5" /> },
                  { id: "email" as const, label: "Ügyfél email", icon: <Send className="w-3.5 h-3.5" /> },
                  { id: "print" as const, label: "Nyomtatható ajánlat", icon: <Printer className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button key={t.id} onClick={() => setOutputTab(t.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${outputTab === t.id ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-3">
                {outputTab === "operator" && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Visual Window / Klaes rendszerbe való gyors átvitelhez</p>
                      <CopyBtn text={operatoriSzoveg} />
                    </div>
                    <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap overflow-x-auto text-gray-700 leading-relaxed max-h-72 overflow-y-auto">{operatoriSzoveg}</pre>
                  </>
                )}
                {outputTab === "email" && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Professzionális magyar email vázlat az ügyfélnek</p>
                      <CopyBtn text={emailSzoveg} />
                    </div>
                    <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap overflow-x-auto text-gray-700 leading-relaxed max-h-72 overflow-y-auto">{emailSzoveg}</pre>
                  </>
                )}
                {outputTab === "print" && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Nyomtatható / PDF exportálható ajánlat-összefoglaló</p>
                      <div className="flex gap-2">
                        <CopyBtn text={nyomtathatoSzoveg} />
                        <button onClick={handlePrint} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                          <Printer className="w-3.5 h-3.5" /> Nyomtatás
                        </button>
                      </div>
                    </div>
                    <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap overflow-x-auto text-gray-700 leading-relaxed max-h-72 overflow-y-auto">{nyomtathatoSzoveg}</pre>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Vissza
              </button>
              <div className="flex gap-2">
                <button onClick={resetDemo} className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                  Új demo
                </button>
                <button onClick={() => setLocation("/landing")} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:brightness-95" style={{ background: "oklch(0.32 0.09 152)" }}>
                  Vissza a landingre <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
