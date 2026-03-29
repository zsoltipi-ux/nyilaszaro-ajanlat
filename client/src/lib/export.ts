/**
 * export.ts – Visual Window & Klaes export + validation engine
 *
 * Visual Window: zárt helyi ERP, nincs API → strukturált szöveg/táblázat
 *   a manuális beviteli sorrendnek megfelelően
 * Klaes: zárt ERP, CSV importot támogat → letölthető .csv fájl
 *   Klaes oszlopsorrendben (Pos, Breite, Höhe, Profil, Farbe, Öffnungsart...)
 */

import type { AjanlatAdatok, Tetel } from "./types";
import {
  KATEGORIA_CIMKEK,
  PROFIL_CIMKEK,
  NYITAS_MOD_CIMKEK,
  NYITAS_IRANY_CIMKEK,
  UVEGEZÉS_CIMKEK,
} from "./types";

// ─── VALIDATION ────────────────────────────────────────────────────────────

export interface ValidationResult {
  exportable: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  type: "error";
  field: string;
  message: string;
  tetelIndex?: number;
}

export interface ValidationWarning {
  type: "warning";
  field: string;
  message: string;
  tetelIndex?: number;
}

export function validateForExport(ajanlat: AjanlatAdatok): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // ── Ügyfél adatok ──
  if (!ajanlat.ugyfel.nev?.trim()) {
    errors.push({ type: "error", field: "ugyfel.nev", message: "Ügyfél neve kötelező" });
  }
  if (!ajanlat.ugyfel.helyszin?.trim()) {
    warnings.push({ type: "warning", field: "ugyfel.helyszin", message: "Helyszín/cím hiányzik – ajánlott megadni" });
  }
  if (!ajanlat.ugyfel.telefon?.trim() && !ajanlat.ugyfel.email?.trim()) {
    warnings.push({ type: "warning", field: "ugyfel.elerhetoseg", message: "Nincs elérhetőség (telefon vagy email)" });
  }

  // ── Projekt adatok ──
  if (!ajanlat.projekt.nev?.trim()) {
    warnings.push({ type: "warning", field: "projekt.nev", message: "Projekt neve hiányzik" });
  }

  // ── Tételek ──
  if (ajanlat.tetelek.length === 0) {
    errors.push({ type: "error", field: "tetelek", message: "Legalább 1 tétel szükséges az exporthoz" });
  }

  ajanlat.tetelek.forEach((t, i) => {
    const idx = i + 1;

    // Kötelező mezők
    if (!t.kategoria) {
      errors.push({ type: "error", field: "kategoria", message: `${idx}. tétel: Kategória kötelező`, tetelIndex: i });
    }
    if (!t.szelesseg || isNaN(Number(t.szelesseg)) || Number(t.szelesseg) < 100) {
      errors.push({ type: "error", field: "szelesseg", message: `${idx}. tétel: Érvényes szélesség kötelező (min. 100 mm)`, tetelIndex: i });
    }
    if (!t.magassag || isNaN(Number(t.magassag)) || Number(t.magassag) < 100) {
      errors.push({ type: "error", field: "magassag", message: `${idx}. tétel: Érvényes magasság kötelező (min. 100 mm)`, tetelIndex: i });
    }

    // Visual Window specifikus ellenőrzések
    if (!t.szin) {
      errors.push({ type: "error", field: "szin", message: `${idx}. tétel: Szín kötelező a Visual Window exporthoz`, tetelIndex: i });
    }
    if (!t.nyitasMod) {
      errors.push({ type: "error", field: "nyitasMod", message: `${idx}. tétel: Nyitásmód kötelező`, tetelIndex: i });
    }

    // Klaes specifikus figyelmeztetések
    if (!t.profilRendszer) {
      warnings.push({ type: "warning", field: "profilRendszer", message: `${idx}. tétel: Profilrendszer hiányzik (Klaes-hez ajánlott)`, tetelIndex: i });
    }
    if (!t.uvegezés) {
      warnings.push({ type: "warning", field: "uvegezés", message: `${idx}. tétel: Üvegezés típusa hiányzik`, tetelIndex: i });
    }

    // Méret határok ellenőrzése
    const w = Number(t.szelesseg);
    const h = Number(t.magassag);
    if (t.kategoria === "ablak" && (w > 3000 || h > 2500)) {
      warnings.push({ type: "warning", field: "meret", message: `${idx}. tétel: Szokatlanul nagy méret (${w}×${h} mm) – ellenőrizze!`, tetelIndex: i });
    }
    if (t.kategoria === "bejárati_ajto" && w > 1500) {
      warnings.push({ type: "warning", field: "meret", message: `${idx}. tétel: Bejárati ajtó szélessége szokatlanul nagy (${w} mm)`, tetelIndex: i });
    }
    if (t.kategoria === "erkelyajto" && h > 2500) {
      warnings.push({ type: "warning", field: "meret", message: `${idx}. tétel: Erkélyajtó magassága szokatlanul nagy (${h} mm)`, tetelIndex: i });
    }

    // Logikai ellenőrzések
    if (t.kategoria === "ablak" && t.nyitasMod === "fix") {
      warnings.push({ type: "warning", field: "nyitasMod", message: `${idx}. tétel: Fix ablak nyitásmódja nem "fix" – ellenőrizze!`, tetelIndex: i });
    }
  });

  const totalChecks = 7 + ajanlat.tetelek.length * 6;
  const errorWeight = errors.length * 10;
  const warningWeight = warnings.length * 3;
  const score = Math.max(0, Math.min(100, 100 - errorWeight - warningWeight));

  return {
    exportable: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

// ─── VISUAL WINDOW EXPORT ──────────────────────────────────────────────────

/**
 * Visual Window strukturált szöveg formátum
 * A VW manuális beviteli sorrendjének megfelelően:
 * Pozíció | Kategória | Szélesség | Magasság | Darab | Profil | Szín | Nyitásmód | Üveg | Kiegészítők
 */
export function generateVisualWindowExport(ajanlat: AjanlatAdatok): string {
  const now = new Date();
  const datum = now.toLocaleDateString("hu-HU");
  const osszesDarab = ajanlat.tetelek.reduce((s, t) => s + parseInt(t.darabszam || "1", 10), 0);

  const lines: string[] = [
    "═══════════════════════════════════════════════════════════════",
    "  VISUAL WINDOW – BEVITELI ÖSSZESÍTŐ",
    "═══════════════════════════════════════════════════════════════",
    `  Ügyfél:    ${ajanlat.ugyfel.nev || "–"}`,
    `  Helyszín:  ${ajanlat.ugyfel.helyszin || "–"}`,
    `  Projekt:   ${ajanlat.projekt.nev || "–"}`,
    `  Dátum:     ${datum}`,
    `  Tételek:   ${ajanlat.tetelek.length} féle · ${osszesDarab} db összesen`,
    "───────────────────────────────────────────────────────────────",
    "",
    "  TÉTELEK (beviteli sorrendben):",
    "",
  ];

  ajanlat.tetelek.forEach((t, i) => {
    const pos = String(i + 1).padStart(2, "0");
    const kat = KATEGORIA_CIMKEK[t.kategoria as keyof typeof KATEGORIA_CIMKEK] || t.kategoria || "–";
    const profil = PROFIL_CIMKEK[t.profilRendszer as keyof typeof PROFIL_CIMKEK] || t.profilRendszer || "–";
    const nyitas = NYITAS_MOD_CIMKEK[t.nyitasMod as keyof typeof NYITAS_MOD_CIMKEK] || t.nyitasMod || "–";
    const irany = NYITAS_IRANY_CIMKEK[t.nyitasIrany as keyof typeof NYITAS_IRANY_CIMKEK] || t.nyitasIrany || "–";
    const uveg = UVEGEZÉS_CIMKEK[t.uvegezés as keyof typeof UVEGEZÉS_CIMKEK] || t.uvegezés || "–";
    const db = parseInt(t.darabszam || "1", 10);

    const kiegeszitok: string[] = [];
    if (t.redony) kiegeszitok.push("Redőny");
    if (t.szunyoghalo) kiegeszitok.push("Szúnyogháló");
    if (t.parkany) kiegeszitok.push("Párkány");
    if (t.egyebKiegeszitok) kiegeszitok.push(t.egyebKiegeszitok);

    lines.push(`  ┌─ Pozíció ${pos} ─────────────────────────────────────────────`);
    lines.push(`  │  Kategória:    ${kat}`);
    lines.push(`  │  Méret:        ${t.szelesseg || "?"} × ${t.magassag || "?"} mm`);
    lines.push(`  │  Darabszám:    ${db} db`);
    lines.push(`  │  Profilrendszer: ${profil}`);
    lines.push(`  │  Szín:         ${t.szin || "–"}`);
    lines.push(`  │  Nyitásmód:    ${nyitas}`);
    lines.push(`  │  Nyitásirány:  ${irany}`);
    lines.push(`  │  Üvegezés:     ${uveg}`);
    if (kiegeszitok.length > 0) {
      lines.push(`  │  Kiegészítők:  ${kiegeszitok.join(", ")}`);
    }
    if (t.belsomegjegyzes) {
      lines.push(`  │  Megjegyzés:   ${t.belsomegjegyzes}`);
    }
    lines.push(`  └──────────────────────────────────────────────────────────`);
    lines.push("");
  });

  lines.push("───────────────────────────────────────────────────────────────");
  lines.push(`  ÖSSZESEN: ${osszesDarab} db nyílászáró`);
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("");
  lines.push("  ⚠ Ez egy előkészítő összesítő. A Visual Window rendszerbe");
  lines.push("    manuálisan kell rögzíteni a fenti adatok alapján.");
  lines.push("═══════════════════════════════════════════════════════════════");

  return lines.join("\n");
}

// ─── KLAES CSV EXPORT ──────────────────────────────────────────────────────

/**
 * Klaes-kompatibilis CSV formátum
 * Klaes standard oszlopok (német elnevezések, ahogy a Klaes importja várja):
 * Pos | Menge | Breite | Höhe | Kategorie | Profil | Farbe | Öffnungsart | Öffnungsrichtung | Verglasung | Extras | Bemerkung
 */
export function generateKlaesCSV(ajanlat: AjanlatAdatok): string {
  const KLAES_KATEGORIA: Record<string, string> = {
    ablak: "Fenster",
    erkelyajto: "Balkontür",
    "bejárati_ajto": "Haustür",
    toloajto: "Schiebetür",
    arnyakolas: "Sonnenschutz",
    egyeb: "Sonstige",
  };

  const KLAES_NYITAS: Record<string, string> = {
    bukonyilo: "Dreh-Kipp",
    nyilo: "Dreh",
    bilego: "Kipp",
    fix: "Fest",
    tolohato: "Schiebe",
    egyeb: "Sonstige",
  };

  const KLAES_IRANY: Record<string, string> = {
    bal: "Links",
    jobb: "Rechts",
    mindket: "Beidseitig",
    na: "N/A",
  };

  const KLAES_UVEG: Record<string, string> = {
    "2_retegu": "2-fach",
    "3_retegu": "3-fach",
    "4_retegu": "4-fach",
    biztonsagi: "VSG",
    egyeb: "Sonstige",
  };

  const header = [
    "Pos",
    "Menge",
    "Breite",
    "Höhe",
    "Kategorie",
    "Profil",
    "Farbe",
    "Öffnungsart",
    "Öffnungsrichtung",
    "Verglasung",
    "Rollladen",
    "Insektenschutz",
    "Fensterbank",
    "Extras",
    "Bemerkung",
    "Projekt",
    "Kunde",
  ].join(";");

  const rows = ajanlat.tetelek.map((t, i) => {
    const extras: string[] = [];
    if (t.egyebKiegeszitok) extras.push(t.egyebKiegeszitok);

    return [
      i + 1,
      parseInt(t.darabszam || "1", 10),
      t.szelesseg || "",
      t.magassag || "",
      KLAES_KATEGORIA[t.kategoria] || t.kategoria || "",
      t.profilRendszer || "",
      t.szin || "",
      KLAES_NYITAS[t.nyitasMod] || t.nyitasMod || "",
      KLAES_IRANY[t.nyitasIrany] || t.nyitasIrany || "",
      KLAES_UVEG[t.uvegezés] || t.uvegezés || "",
      t.redony ? "Ja" : "Nein",
      t.szunyoghalo ? "Ja" : "Nein",
      t.parkany ? "Ja" : "Nein",
      extras.join(", "),
      t.belsomegjegyzes || "",
      ajanlat.projekt.nev || "",
      ajanlat.ugyfel.nev || "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(";");
  });

  return [header, ...rows].join("\n");
}

// ─── DOWNLOAD HELPER ───────────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob(["\uFEFF" + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateFilename(ajanlat: AjanlatAdatok, suffix: string, ext: string): string {
  const nev = (ajanlat.ugyfel.nev || "ajanlat").replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]/g, "").replace(/\s+/g, "_");
  const datum = new Date().toISOString().slice(0, 10);
  return `${nev}_${suffix}_${datum}.${ext}`;
}
