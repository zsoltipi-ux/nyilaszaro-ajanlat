/*
 * Home – Main page of the Hungarian window/door quotation preparation app
 * Design Philosophy: Modern Magyar KKV Eszköz – "Craftsman's Dashboard"
 * Colors: Deep forest green (#1B4332 / oklch(0.32 0.09 152)) + warm white + amber accent
 * Typography: Figtree (headings) + Inter (body)
 * Layout: Sticky header, vertically sectioned, card-based, mobile-friendly
 */

import React, { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  User,
  FolderOpen,
  Wand2,
  LayoutList,
  ClipboardCheck,
  FileOutput,
  Plus,
  ChevronDown,
  ChevronUp,
  Copy,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Home as HomeIcon,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

import SectionCard from "@/components/SectionCard";
import TetelKartya from "@/components/TetelKartya";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseHungarianText } from "@/lib/parser";
import {
  generateOperatoriOsszesito,
  generateUgyfelEmail,
  generateNyomtathatoAjanlat,
  validateAjanlatAdatok,
} from "@/lib/kimenet";
import {
  MINTA_CSALADI_HAZ,
  MINTA_ERKELYAJTO,
  MINTA_BEJÁRATI_AJTO,
} from "@/lib/mintak";
import type {
  AjanlatAdatok,
  UgyfelAdatok,
  ProjektAdatok,
  Tetel,
  AjanlatStatusz,
} from "@/lib/types";
import {
  URES_UGYFEL,
  URES_PROJEKT,
  URES_TETEL,
  KAPCSOLAT_TIPUS_CIMKEK,
} from "@/lib/types";

const INITIAL_AJANLAT: AjanlatAdatok = {
  ugyfel: { ...URES_UGYFEL },
  projekt: { ...URES_PROJEKT },
  tetelek: [],
  statusz: "piszkazat",
  letrehozva: new Date().toISOString(),
  modositva: new Date().toISOString(),
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
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
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white transition-colors"
    />
  );
}

function StatusBadge({ statusz }: { statusz: AjanlatStatusz }) {
  const config = {
    piszkazat: {
      label: "Piszkozat",
      icon: <Clock className="w-3 h-3" />,
      className: "bg-gray-100 text-gray-600",
    },
    ellenorzesre_var: {
      label: "Ellenőrzésre vár",
      icon: <AlertTriangle className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700",
    },
    exportalhato: {
      label: "Exportálható",
      icon: <CheckCircle2 className="w-3 h-3" />,
      className: "bg-green-100 text-green-700",
    },
  };
  const c = config[statusz];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${c.className}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function CopyButton({ text, label = "Másolás" }: { text: string; label?: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Vágólapra másolva!");
    } catch {
      toast.error("Másolás sikertelen");
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
    >
      <Copy className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function OutputBlock({
  title,
  content,
  onPrint,
}: {
  title: string;
  content: string;
  onPrint?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {title}
        </span>
        <div className="flex gap-2">
          <CopyButton text={content} />
          {onPrint && (
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Nyomtatás
            </button>
          )}
        </div>
      </div>
      <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap overflow-x-auto text-gray-700 leading-relaxed max-h-64 overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [ajanlat, setAjanlat] = useLocalStorage<AjanlatAdatok>(
    "nyilaszaro-ajanlat-v1",
    INITIAL_AJANLAT
  );
  const [szabadSzoveg, setSzabadSzoveg] = useState("");
  const [activeTab, setActiveTab] = useState<"operator" | "email" | "print">("operator");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);

  const updateUgyfel = useCallback(
    (field: keyof UgyfelAdatok, value: string) => {
      setAjanlat((prev) => ({
        ...prev,
        ugyfel: { ...prev.ugyfel, [field]: value },
        modositva: new Date().toISOString(),
      }));
    },
    [setAjanlat]
  );

  const updateProjekt = useCallback(
    (field: keyof ProjektAdatok, value: string) => {
      setAjanlat((prev) => ({
        ...prev,
        projekt: { ...prev.projekt, [field]: value },
        modositva: new Date().toISOString(),
      }));
    },
    [setAjanlat]
  );

  const addTetel = useCallback(() => {
    const newTetel: Tetel = { id: nanoid(), ...URES_TETEL };
    setAjanlat((prev) => ({
      ...prev,
      tetelek: [...prev.tetelek, newTetel],
      statusz: "ellenorzesre_var",
      modositva: new Date().toISOString(),
    }));
  }, [setAjanlat]);

  const updateTetel = useCallback(
    (id: string, tetel: Tetel) => {
      setAjanlat((prev) => ({
        ...prev,
        tetelek: prev.tetelek.map((t) => (t.id === id ? tetel : t)),
        modositva: new Date().toISOString(),
      }));
    },
    [setAjanlat]
  );

  const deleteTetel = useCallback(
    (id: string) => {
      setAjanlat((prev) => ({
        ...prev,
        tetelek: prev.tetelek.filter((t) => t.id !== id),
        modositva: new Date().toISOString(),
      }));
      toast.success("Tétel törölve");
    },
    [setAjanlat]
  );

  const copyTetel = useCallback(
    (tetel: Tetel) => {
      const newTetel: Tetel = { ...tetel, id: nanoid() };
      setAjanlat((prev) => ({
        ...prev,
        tetelek: [...prev.tetelek, newTetel],
        modositva: new Date().toISOString(),
      }));
      toast.success("Tétel másolva");
    },
    [setAjanlat]
  );

  const feldolgozSzoveg = useCallback(() => {
    if (!szabadSzoveg.trim()) {
      toast.error("Kérjük, írjon be szöveget a feldolgozáshoz");
      return;
    }
    const parsed = parseHungarianText(szabadSzoveg);
    if (parsed.length === 0) {
      toast.error("Nem sikerült tételeket felismerni a szövegből");
      return;
    }
    setAjanlat((prev) => ({
      ...prev,
      tetelek: [...prev.tetelek, ...parsed],
      statusz: "ellenorzesre_var",
      modositva: new Date().toISOString(),
    }));
    setSzabadSzoveg("");
    toast.success(`${parsed.length} tétel hozzáadva – kérjük ellenőrizze az adatokat!`);
  }, [szabadSzoveg, setAjanlat]);

  const loadMinta = useCallback(
    (minta: AjanlatAdatok) => {
      setAjanlat({
        ...minta,
        letrehozva: new Date().toISOString(),
        modositva: new Date().toISOString(),
      });
      toast.success("Mintaadatok betöltve!");
    },
    [setAjanlat]
  );

  const resetAjanlat = useCallback(() => {
    if (window.confirm("Biztosan törli az összes adatot?")) {
      setAjanlat(INITIAL_AJANLAT);
      setSzabadSzoveg("");
      toast.success("Ajánlat törölve");
    }
  }, [setAjanlat]);

  const updateStatusz = useCallback(
    (statusz: AjanlatStatusz) => {
      setAjanlat((prev) => ({ ...prev, statusz, modositva: new Date().toISOString() }));
    },
    [setAjanlat]
  );

  const validacioHibak = validateAjanlatAdatok(ajanlat);
  const osszesDarab = ajanlat.tetelek.reduce(
    (sum, t) => sum + parseInt(t.darabszam || "1", 10),
    0
  );

  const operatoriSzoveg = generateOperatoriOsszesito(ajanlat);
  const emailSzoveg = generateUgyfelEmail(ajanlat);
  const nyomtathatoSzoveg = generateNyomtathatoAjanlat(ajanlat);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Ajánlat összefoglaló</title>
        <style>body{font-family:monospace;font-size:12px;padding:20px;white-space:pre-wrap;}</style>
        </head><body>${nyomtathatoSzoveg}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const SECTIONS = [
    { id: "ugyfel", label: "Ügyfél" },
    { id: "projekt", label: "Projekt" },
    { id: "szoveg", label: "Szöveg" },
    { id: "tetelek", label: "Tételek" },
    { id: "osszesito", label: "Összesítő" },
    { id: "kimenetek", label: "Kimenetek" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.985 0.003 90)" }}>
      {/* ─── STICKY HEADER ─── */}
      <header
        className="sticky top-0 z-50 border-b border-gray-200 shadow-sm no-print"
        style={{ background: "oklch(0.28 0.08 152)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo + Title */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: "oklch(0.65 0.12 80)" }}
              >
                <HomeIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm font-[Figtree] leading-tight">
                  Nyílászáró Ajánlat
                </div>
                <div className="text-green-200 text-xs leading-tight hidden sm:block">
                  Ajánlat-előkészítő
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-xs text-green-200 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocation("/landing")}
                  className="hidden sm:inline-flex items-center gap-1 text-xs text-green-200 hover:text-white border border-green-600/40 px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Landing
                </button>
                <StatusBadge statusz={ajanlat.statusz} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-md text-green-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 border-t border-green-700">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-green-200 hover:text-white px-2 py-2 rounded-md hover:bg-white/10 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ─── HERO ─── */}
      <div
        className="no-print"
        style={{ background: "linear-gradient(135deg, oklch(0.28 0.08 152) 0%, oklch(0.35 0.09 152) 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-[Figtree] leading-tight">
                Nyílászáró ajánlat-előkészítő
              </h1>
              <p className="text-green-200 text-sm mt-1.5 max-w-lg">
                Gyors ügyfélfelvétel, strukturált tételek, ajánlat-előkészítés percek alatt
              </p>
            </div>

            {/* Sample data buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadMinta(MINTA_CSALADI_HAZ)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-green-400/40 text-green-100 hover:bg-white/10 transition-colors"
              >
                🏠 Minta családi ház
              </button>
              <button
                onClick={() => loadMinta(MINTA_ERKELYAJTO)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-green-400/40 text-green-100 hover:bg-white/10 transition-colors"
              >
                🚪 Minta erkélyajtó
              </button>
              <button
                onClick={() => loadMinta(MINTA_BEJÁRATI_AJTO)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-green-400/40 text-green-100 hover:bg-white/10 transition-colors"
              >
                🔑 Minta bejárati ajtó
              </button>
              <button
                onClick={resetAjanlat}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-400/40 text-red-200 hover:bg-red-500/10 transition-colors"
              >
                Törlés
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── 1. ÜGYFÉL ADATOK ── */}
        <div id="ugyfel">
          <SectionCard
            title="Ügyfél adatok"
            subtitle="Az ügyfél kapcsolattartási adatai"
            icon={<User className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Ügyfél neve</FieldLabel>
                <TextInput
                  value={ajanlat.ugyfel.nev}
                  onChange={(v) => updateUgyfel("nev", v)}
                  placeholder="pl. Kovács István"
                />
              </div>
              <div>
                <FieldLabel>Telefonszám</FieldLabel>
                <TextInput
                  type="tel"
                  value={ajanlat.ugyfel.telefon}
                  onChange={(v) => updateUgyfel("telefon", v)}
                  placeholder="+36 30 123 4567"
                />
              </div>
              <div>
                <FieldLabel>Email cím</FieldLabel>
                <TextInput
                  type="email"
                  value={ajanlat.ugyfel.email}
                  onChange={(v) => updateUgyfel("email", v)}
                  placeholder="pelda@email.hu"
                />
              </div>
              <div>
                <FieldLabel>Helyszín / cím</FieldLabel>
                <TextInput
                  value={ajanlat.ugyfel.helyszin}
                  onChange={(v) => updateUgyfel("helyszin", v)}
                  placeholder="1234 Budapest, Példa utca 1."
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Megjegyzés</FieldLabel>
                <textarea
                  value={ajanlat.ugyfel.megjegyzes}
                  onChange={(e) => updateUgyfel("megjegyzes", e.target.value)}
                  placeholder="Ügyfélhez kapcsolódó megjegyzés..."
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white resize-none transition-colors"
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── 2. PROJEKT ADATOK ── */}
        <div id="projekt">
          <SectionCard
            title="Projekt adatok"
            subtitle="A projekt azonosítása és belső adatok"
            icon={<FolderOpen className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Projekt neve / azonosító</FieldLabel>
                <TextInput
                  value={ajanlat.projekt.nev}
                  onChange={(v) => updateProjekt("nev", v)}
                  placeholder="pl. Kovács - Rózsa utca felújítás"
                />
              </div>
              <div>
                <FieldLabel>Kapcsolat típusa</FieldLabel>
                <select
                  value={ajanlat.projekt.kapcsolatTipus}
                  onChange={(e) => updateProjekt("kapcsolatTipus", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white"
                >
                  <option value="">Válassz típust...</option>
                  {Object.entries(KAPCSOLAT_TIPUS_CIMKEK).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Határidő / sürgősség</FieldLabel>
                <TextInput
                  value={ajanlat.projekt.hataridoSurgosseg}
                  onChange={(v) => updateProjekt("hataridoSurgosseg", v)}
                  placeholder="pl. 2024. március vége, sürgős"
                />
              </div>
              <div>
                <FieldLabel>Belső megjegyzés</FieldLabel>
                <TextInput
                  value={ajanlat.projekt.belsomegjegyzes}
                  onChange={(v) => updateProjekt("belsomegjegyzes", v)}
                  placeholder="Belső megjegyzés a projekthez..."
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── 3. SZABAD SZÖVEGES FELDOLGOZÁS ── */}
        <div id="szoveg">
          <SectionCard
            title="Szabad szöveges feldolgozás"
            subtitle="Írja be az igényt szabad szövegként – a rendszer strukturált tételekké alakítja"
            icon={<Wand2 className="w-4 h-4" />}
          >
            <div className="space-y-3">
              <textarea
                value={szabadSzoveg}
                onChange={(e) => setSzabadSzoveg(e.target.value)}
                placeholder={`Példák (soronként vagy pontosvesszővel elválasztva):\n2 db 120x150 bukó-nyíló jobb fehér Rehau ablak 3 rétegű üveggel, redőnnyel\nbejárati ajtó antracit 100x210, balos nyitás\nerkélyajtó 90x210, bukó-nyíló, szúnyoghálóval`}
                rows={5}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white resize-none transition-colors font-mono"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Felismeri: darabszám, méretek, kategória, nyitásmód, irány, szín, profilrendszer, üvegezés, redőny, szúnyogháló
                </p>
                <button
                  onClick={feldolgozSzoveg}
                  className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:brightness-95 active:scale-95"
                  style={{ background: "oklch(0.32 0.09 152)" }}
                >
                  <Wand2 className="w-4 h-4" />
                  Szöveg feldolgozása
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── 4. TÉTELEK ── */}
        <div id="tetelek">
          <SectionCard
            title="Tételek"
            subtitle={`${ajanlat.tetelek.length} tétel rögzítve, összesen ${osszesDarab} db`}
            icon={<LayoutList className="w-4 h-4" />}
            badge={
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white" style={{ background: "oklch(0.32 0.09 152)" }}>
                {ajanlat.tetelek.length}
              </span>
            }
          >
            <div className="space-y-3">
              {ajanlat.tetelek.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <LayoutList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Még nincsenek tételek</p>
                  <p className="text-xs mt-1">
                    Adjon hozzá tételt kézzel, vagy használja a szabad szöveges feldolgozást
                  </p>
                </div>
              ) : (
                ajanlat.tetelek.map((tetel, idx) => (
                  <TetelKartya
                    key={tetel.id}
                    tetel={tetel}
                    index={idx + 1}
                    onChange={(t) => updateTetel(tetel.id, t)}
                    onDelete={() => deleteTetel(tetel.id)}
                    onCopy={() => copyTetel(tetel)}
                  />
                ))
              )}

              <button
                onClick={addTetel}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-[oklch(0.32_0.09_152)] hover:text-[oklch(0.32_0.09_152)] hover:bg-green-50/50 transition-all"
              >
                <Plus className="w-4 h-4" />
                Új tétel hozzáadása
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ── 5. ELLENŐRZŐ / ÖSSZESÍTŐ ── */}
        <div id="osszesito">
          <SectionCard
            title="Ellenőrző összesítő"
            subtitle="Áttekintés és validáció exportálás előtt"
            icon={<ClipboardCheck className="w-4 h-4" />}
            badge={<StatusBadge statusz={ajanlat.statusz} />}
          >
            <div className="space-y-4">
              {/* Validation errors */}
              {validacioHibak.length > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-amber-800">
                      Hiányzó adatok ({validacioHibak.length})
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {validacioHibak.map((hiba, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                        {hiba}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-800">
                    Minden kötelező adat kitöltve – ajánlat exportálható
                  </span>
                </div>
              )}

              {/* Summary table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Ügyfél</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {ajanlat.ugyfel.nev || "–"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {ajanlat.ugyfel.telefon || ajanlat.ugyfel.email || "Nincs elérhetőség"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Projekt</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {ajanlat.projekt.nev || "–"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {ajanlat.projekt.hataridoSurgosseg || "Nincs határidő"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Tételek</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {ajanlat.tetelek.length} féle tétel
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Összesen {osszesDarab} db nyílászáró
                  </div>
                </div>
              </div>

              {/* Items quick list */}
              {ajanlat.tetelek.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tételek listája
                  </div>
                  {ajanlat.tetelek.map((t, i) => {
                    const kat = t.kategoria
                      ? { ablak: "Ablak", erkelyajto: "Erkélyajtó", "bejárati_ajto": "Bejárati ajtó", toloajto: "Tolóajtó", arnyakolas: "Árnyékolás", egyeb: "Egyéb" }[t.kategoria] || t.kategoria
                      : "–";
                    const meret = t.szelesseg && t.magassag ? `${t.szelesseg}×${t.magassag}` : "méret hiányzik";
                    const hasError = !t.kategoria || !t.szelesseg || !t.magassag;
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-md ${hasError ? "bg-amber-50" : "bg-gray-50"}`}
                      >
                        <span className="text-gray-700">
                          <span className="font-medium">{i + 1}.</span> {t.darabszam || 1} db {kat}
                          {t.szin ? ` · ${t.szin}` : ""}
                        </span>
                        <span className={`font-mono ${hasError ? "text-amber-600" : "text-gray-500"}`}>
                          {meret} mm
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Status control */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-gray-500">Státusz beállítása:</span>
                {(["piszkazat", "ellenorzesre_var", "exportalhato"] as AjanlatStatusz[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => updateStatusz(s)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        ajanlat.statusz === s
                          ? "border-[oklch(0.32_0.09_152)] bg-green-50 text-[oklch(0.32_0.09_152)] font-semibold"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {s === "piszkazat" ? "Piszkozat" : s === "ellenorzesre_var" ? "Ellenőrzésre vár" : "Exportálható"}
                    </button>
                  )
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── 6. KIMENETEK ── */}
        <div id="kimenetek">
          <SectionCard
            title="Kimenetek"
            subtitle="Generált szövegek másoláshoz, küldéshez, nyomtatáshoz"
            icon={<FileOutput className="w-4 h-4" />}
            badge={
              <button
                onClick={() => setOutputOpen(!outputOpen)}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {outputOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {outputOpen ? "Összecsuk" : "Megnyit"}
              </button>
            }
          >
            {!outputOpen ? (
              <div className="text-center py-6">
                <button
                  onClick={() => setOutputOpen(true)}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-all hover:brightness-95 active:scale-95"
                  style={{ background: "oklch(0.72 0.15 75)" }}
                >
                  <FileOutput className="w-4 h-4" />
                  Kimenetek generálása
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Operátori összesítő · Ügyfél email · Nyomtatható ajánlat
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {(
                    [
                      { id: "operator", label: "Operátori összesítő" },
                      { id: "email", label: "Ügyfél email" },
                      { id: "print", label: "Nyomtatható ajánlat" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "operator" && (
                  <OutputBlock title="Operátori összesítő – Visual Window / Klaes átvitelhez" content={operatoriSzoveg} />
                )}
                {activeTab === "email" && (
                  <OutputBlock title="Ügyfél email vázlat" content={emailSzoveg} />
                )}
                {activeTab === "print" && (
                  <OutputBlock
                    title="Nyomtatható ajánlat-összefoglaló"
                    content={nyomtathatoSzoveg}
                    onPrint={handlePrint}
                  />
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-400 no-print">
          <p>Nyílászáró Ajánlat-előkészítő · MVP · Adatok localStorage-ben tárolva</p>
          <p className="mt-1">
            Utoljára módosítva:{" "}
            {new Date(ajanlat.modositva).toLocaleString("hu-HU")}
          </p>
        </footer>
      </main>
    </div>
  );
}
