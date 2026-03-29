// Output generation for the quotation app
// Generates: operator summary, client email draft, printable offer summary

import type { AjanlatAdatok, Tetel } from "./types";
import {
  KATEGORIA_CIMKEK,
  PROFIL_CIMKEK,
  NYITAS_MOD_CIMKEK,
  NYITAS_IRANY_CIMKEK,
  UVEGEZÉS_CIMKEK,
  KAPCSOLAT_TIPUS_CIMKEK,
} from "./types";

function formatTetelSor(t: Tetel, idx: number): string {
  const kat = t.kategoria ? KATEGORIA_CIMKEK[t.kategoria as keyof typeof KATEGORIA_CIMKEK] || t.kategoria : "–";
  const profil = t.profilRendszer ? PROFIL_CIMKEK[t.profilRendszer as keyof typeof PROFIL_CIMKEK] || t.profilRendszer : "–";
  const meret = t.szelesseg && t.magassag ? `${t.szelesseg}×${t.magassag} mm` : "méret hiányzik";
  const nyitas = t.nyitasMod ? NYITAS_MOD_CIMKEK[t.nyitasMod as keyof typeof NYITAS_MOD_CIMKEK] : "";
  const irany = t.nyitasIrany && t.nyitasIrany !== "na" ? NYITAS_IRANY_CIMKEK[t.nyitasIrany as keyof typeof NYITAS_IRANY_CIMKEK] : "";
  const uveg = t.uvegezés ? UVEGEZÉS_CIMKEK[t.uvegezés as keyof typeof UVEGEZÉS_CIMKEK] : "";
  const kiegeszitok = [
    t.parkany ? "párkány" : "",
    t.redony ? "redőny" : "",
    t.szunyoghalo ? "szúnyogháló" : "",
    t.egyebKiegeszitok || "",
  ]
    .filter(Boolean)
    .join(", ");

  let sor = `${idx}. ${t.darabszam || 1} db ${kat}`;
  if (meret !== "méret hiányzik") sor += ` ${meret}`;
  if (profil !== "–") sor += ` | ${profil}`;
  if (t.szin) sor += ` | ${t.szin}`;
  if (nyitas) sor += ` | ${nyitas}`;
  if (irany) sor += ` ${irany}`;
  if (uveg) sor += ` | ${uveg} üveg`;
  if (kiegeszitok) sor += ` | Kieg.: ${kiegeszitok}`;
  if (t.belsomegjegyzes && t.belsomegjegyzes !== sor) sor += `\n   Megjegyzés: ${t.belsomegjegyzes}`;
  return sor;
}

export function generateOperatoriOsszesito(adat: AjanlatAdatok): string {
  const { ugyfel, projekt, tetelek } = adat;
  const datum = new Date().toLocaleDateString("hu-HU");
  const osszesDarab = tetelek.reduce((sum, t) => sum + parseInt(t.darabszam || "1", 10), 0);

  const kapcsolatCimke = projekt.kapcsolatTipus
    ? KAPCSOLAT_TIPUS_CIMKEK[projekt.kapcsolatTipus as keyof typeof KAPCSOLAT_TIPUS_CIMKEK] || projekt.kapcsolatTipus
    : "–";

  const lines: string[] = [
    "═══════════════════════════════════════════",
    "  OPERÁTORI ÖSSZESÍTŐ – AJÁNLAT ELŐKÉSZÍTŐ",
    "═══════════════════════════════════════════",
    `Dátum: ${datum}`,
    `Projekt: ${projekt.nev || "–"}`,
    `Kapcsolat típusa: ${kapcsolatCimke}`,
    projekt.hataridoSurgosseg ? `Határidő/Sürgősség: ${projekt.hataridoSurgosseg}` : "",
    "",
    "ÜGYFÉL ADATOK:",
    `  Név: ${ugyfel.nev || "–"}`,
    `  Telefon: ${ugyfel.telefon || "–"}`,
    `  Email: ${ugyfel.email || "–"}`,
    `  Helyszín: ${ugyfel.helyszin || "–"}`,
    ugyfel.megjegyzes ? `  Megjegyzés: ${ugyfel.megjegyzes}` : "",
    "",
    `TÉTELEK (összesen: ${tetelek.length} féle, ${osszesDarab} db):`,
    "───────────────────────────────────────────",
    ...tetelek.map((t, i) => formatTetelSor(t, i + 1)),
    "───────────────────────────────────────────",
    projekt.belsomegjegyzes ? `\nBelső megjegyzés: ${projekt.belsomegjegyzes}` : "",
    "",
    "→ Átvitel: Visual Window / Klaes rendszerbe",
    "═══════════════════════════════════════════",
  ];

  return lines.filter((l) => l !== undefined).join("\n").replace(/\n{3,}/g, "\n\n");
}

export function generateUgyfelEmail(adat: AjanlatAdatok): string {
  const { ugyfel, projekt, tetelek } = adat;
  const osszesDarab = tetelek.reduce((sum, t) => sum + parseInt(t.darabszam || "1", 10), 0);
  const nevSzolitas = ugyfel.nev ? `${ugyfel.nev.split(" ").pop()} úr/hölgy` : "Tisztelt Érdeklődő";

  const tetelLista = tetelek
    .map((t, i) => {
      const kat = t.kategoria ? KATEGORIA_CIMKEK[t.kategoria as keyof typeof KATEGORIA_CIMKEK] || t.kategoria : "tétel";
      const meret = t.szelesseg && t.magassag ? ` (${t.szelesseg}×${t.magassag} mm)` : "";
      return `  • ${t.darabszam || 1} db ${kat}${meret}`;
    })
    .join("\n");

  return `Tárgy: Nyílászáró ajánlat – ${projekt.nev || "ajánlatkérés"}

Tisztelt ${nevSzolitas}!

Köszönjük megkeresését! Örömmel tájékoztatjuk, hogy rögzítettük az Ön nyílászáró igényét, és ajánlatunk előkészítés alatt van.

Az Ön által igényelt tételek összefoglalója:

${tetelLista}

Összesen: ${osszesDarab} db nyílászáró${ugyfel.helyszin ? `, helyszín: ${ugyfel.helyszin}` : ""}.

${projekt.hataridoSurgosseg ? `Megadott határidő/sürgősség: ${projekt.hataridoSurgosseg}\n\n` : ""}Részletes árajánlatunkat hamarosan elküldjük Önnek. Amennyiben addig kérdése merülne fel, kérjük, keressen minket bizalommal.

Üdvözlettel,

[Cég neve]
[Kapcsolattartó neve]
[Telefonszám]
[Email cím]
[Weboldal]`;
}

export function generateNyomtathatoAjanlat(adat: AjanlatAdatok): string {
  const { ugyfel, projekt, tetelek } = adat;
  const datum = new Date().toLocaleDateString("hu-HU");
  const osszesDarab = tetelek.reduce((sum, t) => sum + parseInt(t.darabszam || "1", 10), 0);

  const tetelSorok = tetelek
    .map((t, i) => {
      const kat = t.kategoria ? KATEGORIA_CIMKEK[t.kategoria as keyof typeof KATEGORIA_CIMKEK] || t.kategoria : "–";
      const profil = t.profilRendszer ? PROFIL_CIMKEK[t.profilRendszer as keyof typeof PROFIL_CIMKEK] || t.profilRendszer : "–";
      const meret = t.szelesseg && t.magassag ? `${t.szelesseg}×${t.magassag}` : "–";
      const nyitas = t.nyitasMod ? NYITAS_MOD_CIMKEK[t.nyitasMod as keyof typeof NYITAS_MOD_CIMKEK] : "–";
      const uveg = t.uvegezés ? UVEGEZÉS_CIMKEK[t.uvegezés as keyof typeof UVEGEZÉS_CIMKEK] : "–";
      const kieg = [
        t.parkany ? "párkány" : "",
        t.redony ? "redőny" : "",
        t.szunyoghalo ? "szúnyogháló" : "",
      ].filter(Boolean).join(", ") || "–";

      return `${String(i + 1).padStart(2, " ")}. | ${t.darabszam || 1} db | ${kat.padEnd(14)} | ${meret.padEnd(9)} | ${profil.padEnd(7)} | ${t.szin || "–"} | ${nyitas} | ${uveg} | ${kieg}`;
    })
    .join("\n");

  return `╔══════════════════════════════════════════════════════════════╗
║          NYÍLÁSZÁRÓ AJÁNLAT-ÖSSZEFOGLALÓ                     ║
╚══════════════════════════════════════════════════════════════╝

Dátum: ${datum}                    Projekt: ${projekt.nev || "–"}

ÜGYFÉL:
  Név:       ${ugyfel.nev || "–"}
  Telefon:   ${ugyfel.telefon || "–"}
  Email:     ${ugyfel.email || "–"}
  Helyszín:  ${ugyfel.helyszin || "–"}

TÉTELEK:
──────────────────────────────────────────────────────────────
 #  | db  | Kategória      | Méret (mm) | Profil  | Szín | Nyitás | Üveg | Kieg.
──────────────────────────────────────────────────────────────
${tetelSorok}
──────────────────────────────────────────────────────────────
Összesen: ${tetelek.length} féle tétel, ${osszesDarab} db nyílászáró

${ugyfel.megjegyzes ? `Ügyfél megjegyzése: ${ugyfel.megjegyzes}\n` : ""}${projekt.belsomegjegyzes ? `Belső megjegyzés: ${projekt.belsomegjegyzes}\n` : ""}
──────────────────────────────────────────────────────────────
Ez az összefoglaló ajánlat-előkészítő célokra készült.
Az árak és szállítási feltételek külön ajánlatban szerepelnek.
══════════════════════════════════════════════════════════════`;
}

export function validateAjanlatAdatok(adat: AjanlatAdatok): string[] {
  const hibak: string[] = [];

  if (!adat.ugyfel.nev) hibak.push("Ügyfél neve hiányzik");
  if (!adat.ugyfel.telefon && !adat.ugyfel.email)
    hibak.push("Legalább egy elérhetőség (telefon vagy email) szükséges");
  if (!adat.projekt.nev) hibak.push("Projekt neve hiányzik");
  if (adat.tetelek.length === 0) hibak.push("Nincs rögzített tétel");

  adat.tetelek.forEach((t, i) => {
    if (!t.szelesseg || !t.magassag)
      hibak.push(`${i + 1}. tétel: méret hiányzik`);
    if (!t.kategoria) hibak.push(`${i + 1}. tétel: kategória hiányzik`);
  });

  return hibak;
}
