// Hungarian window/door text parser
// Parses free-form Hungarian text descriptions into structured item data

import { nanoid } from "nanoid";
import type {
  Tetel,
  TetelKategoria,
  ProfilRendszer,
  NyitasMod,
  NyitasIrany,
  Uvegezés,
} from "./types";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[éÉ]/g, "e")
    .replace(/[áÁ]/g, "a")
    .replace(/[íÍ]/g, "i")
    .replace(/[óÓöÖőŐ]/g, "o")
    .replace(/[úÚüÜűŰ]/g, "u");
}

function detectKategoria(text: string): TetelKategoria {
  const n = normalizeText(text);
  if (n.includes("bejarat") || n.includes("bejaro") || n.includes("bejárat")) return "bejárati_ajto";
  if (n.includes("erkely") || n.includes("erkelyajto")) return "erkelyajto";
  if (n.includes("tolo") || n.includes("tolohato")) return "toloajto";
  if (n.includes("arnyekolo") || n.includes("redony") || n.includes("jaluzsi") || n.includes("arnyakolas")) return "arnyakolas";
  if (n.includes("ajto") || n.includes("ajtó")) return "erkelyajto";
  if (n.includes("ablak")) return "ablak";
  return "ablak";
}

function detectProfil(text: string): ProfilRendszer | "" {
  const n = normalizeText(text);
  if (n.includes("rehau")) return "Rehau";
  if (n.includes("gealan")) return "Gealan";
  if (n.includes("veka")) return "Veka";
  return "";
}

function detectMeretek(text: string): { szelesseg: string; magassag: string } {
  // Match patterns like: 120x150, 120 x 150, 120*150, 120/150
  const meretkPattern = /(\d{2,4})\s*[x×*\/]\s*(\d{2,4})/i;
  const match = text.match(meretkPattern);
  if (match) {
    return { szelesseg: match[1], magassag: match[2] };
  }
  // Try "120 cm x 150 cm" pattern
  const cmPattern = /(\d{2,4})\s*cm\s*[x×*\/]\s*(\d{2,4})\s*cm/i;
  const cmMatch = text.match(cmPattern);
  if (cmMatch) {
    return { szelesseg: cmMatch[1], magassag: cmMatch[2] };
  }
  return { szelesseg: "", magassag: "" };
}

function detectDarabszam(text: string): string {
  // Match "2 db", "3db", "2 darab" at start or before category
  const dbPattern = /(\d+)\s*(?:db|darab)/i;
  const match = text.match(dbPattern);
  if (match) return match[1];
  // Match leading number: "2 ablak"
  const leadingPattern = /^(\d+)\s+(?:ablak|ajto|ajtó|erkely)/i;
  const leadingMatch = text.match(leadingPattern);
  if (leadingMatch) return leadingMatch[1];
  return "1";
}

function detectNyitasMod(text: string): NyitasMod | "" {
  const n = normalizeText(text);
  if (n.includes("buko-nyilo") || n.includes("bukonyilo") || n.includes("buko nyilo")) return "bukonyilo";
  if (n.includes("buko")) return "bukonyilo";
  if (n.includes("nyilo") || n.includes("nyíló")) return "nyilo";
  if (n.includes("fix")) return "fix";
  if (n.includes("tolo") || n.includes("tolohato")) return "tolohato";
  if (n.includes("bilego")) return "bilego";
  return "";
}

function detectNyitasIrany(text: string): NyitasIrany | "" {
  const n = normalizeText(text);
  if (n.includes("balos") || n.includes("bal nyitas") || n.includes("bal oldal")) return "bal";
  if (n.includes("jobbos") || n.includes("jobb nyitas") || n.includes("jobb oldal")) return "jobb";
  if (n.includes("bal")) return "bal";
  if (n.includes("jobb")) return "jobb";
  return "";
}

function detectSzin(text: string): string {
  const n = normalizeText(text);
  const szinek: Record<string, string> = {
    feher: "Fehér",
    antracit: "Antracit",
    barna: "Barna",
    arany: "Arany tölgy",
    tolgy: "Tölgy",
    dio: "Dió",
    szurke: "Szürke",
    fekete: "Fekete",
    "golden oak": "Golden oak",
    "winchester": "Winchester",
  };
  for (const [key, val] of Object.entries(szinek)) {
    if (n.includes(key)) return val;
  }
  return "";
}

function detectUvegezés(text: string): Uvegezés | "" {
  const n = normalizeText(text);
  if (n.includes("4 reteg") || n.includes("4reteg") || n.includes("negyretegu")) return "4_retegu";
  if (n.includes("3 reteg") || n.includes("3reteg") || n.includes("haromretegu") || n.includes("harom retegu")) return "3_retegu";
  if (n.includes("2 reteg") || n.includes("2reteg") || n.includes("ketretegu") || n.includes("ket reteg")) return "2_retegu";
  if (n.includes("biztonsagi") || n.includes("biztonsag")) return "biztonsagi";
  return "";
}

function detectRedony(text: string): boolean {
  const n = normalizeText(text);
  return n.includes("redony") || n.includes("roletta");
}

function detectSzunyoghalo(text: string): boolean {
  const n = normalizeText(text);
  return n.includes("szunyoghalo") || n.includes("szunyog halo") || n.includes("szunyog-halo");
}

function detectParkany(text: string): boolean {
  const n = normalizeText(text);
  return n.includes("parkany") || n.includes("ablakparkany");
}

// Parse a single line of text into a Tetel
function parseSingleLine(line: string): Tetel {
  const meretek = detectMeretek(line);
  return {
    id: nanoid(),
    kategoria: detectKategoria(line),
    profilRendszer: detectProfil(line),
    szelesseg: meretek.szelesseg,
    magassag: meretek.magassag,
    darabszam: detectDarabszam(line),
    nyitasMod: detectNyitasMod(line),
    nyitasIrany: detectNyitasIrany(line),
    szin: detectSzin(line),
    uvegezés: detectUvegezés(line),
    parkany: detectParkany(line),
    redony: detectRedony(line),
    szunyoghalo: detectSzunyoghalo(line),
    egyebKiegeszitok: "",
    belsomegjegyzes: line.trim(),
  };
}

// Main parser: splits multi-line text and parses each line
export function parseHungarianText(text: string): Tetel[] {
  if (!text.trim()) return [];

  // Split by newlines or semicolons or commas followed by a digit/keyword
  const lines = text
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  if (lines.length === 0) return [];

  return lines.map(parseSingleLine);
}
