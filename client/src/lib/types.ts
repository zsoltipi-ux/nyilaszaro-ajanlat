// Data types for the Hungarian window/door quotation preparation app

export type KapcsolatTipus =
  | "bejovo_erdeklodes"
  | "felmeres"
  | "visszahivas"
  | "meglevo_ugyfel";

export type AjanlatStatusz = "piszkazat" | "ellenorzesre_var" | "exportalhato";

export type TetelKategoria =
  | "ablak"
  | "erkelyajto"
  | "bejárati_ajto"
  | "toloajto"
  | "arnyakolas"
  | "egyeb";

export type ProfilRendszer = "Rehau" | "Gealan" | "Veka" | "egyeb";

export type NyitasMod =
  | "bukonyilo"
  | "nyilo"
  | "fix"
  | "tolohato"
  | "bilego"
  | "egyeb";

export type NyitasIrany = "bal" | "jobb" | "mindket" | "na";

export type Uvegezés =
  | "2_retegu"
  | "3_retegu"
  | "4_retegu"
  | "biztonsagi"
  | "egyeb";

export interface UgyfelAdatok {
  nev: string;
  telefon: string;
  email: string;
  helyszin: string;
  megjegyzes: string;
}

export interface ProjektAdatok {
  nev: string;
  kapcsolatTipus: KapcsolatTipus | "";
  hataridoSurgosseg: string;
  belsomegjegyzes: string;
}

export interface Tetel {
  id: string;
  kategoria: TetelKategoria | "";
  profilRendszer: ProfilRendszer | "";
  szelesseg: string;
  magassag: string;
  darabszam: string;
  nyitasMod: NyitasMod | "";
  nyitasIrany: NyitasIrany | "";
  szin: string;
  uvegezés: Uvegezés | "";
  parkany: boolean;
  redony: boolean;
  szunyoghalo: boolean;
  egyebKiegeszitok: string;
  belsomegjegyzes: string;
}

export interface AjanlatAdatok {
  ugyfel: UgyfelAdatok;
  projekt: ProjektAdatok;
  tetelek: Tetel[];
  statusz: AjanlatStatusz;
  letrehozva: string;
  modositva: string;
}

export const URES_UGYFEL: UgyfelAdatok = {
  nev: "",
  telefon: "",
  email: "",
  helyszin: "",
  megjegyzes: "",
};

export const URES_PROJEKT: ProjektAdatok = {
  nev: "",
  kapcsolatTipus: "",
  hataridoSurgosseg: "",
  belsomegjegyzes: "",
};

export const URES_TETEL: Omit<Tetel, "id"> = {
  kategoria: "",
  profilRendszer: "",
  szelesseg: "",
  magassag: "",
  darabszam: "1",
  nyitasMod: "",
  nyitasIrany: "",
  szin: "",
  uvegezés: "",
  parkany: false,
  redony: false,
  szunyoghalo: false,
  egyebKiegeszitok: "",
  belsomegjegyzes: "",
};

export const KATEGORIA_CIMKEK: Record<TetelKategoria, string> = {
  ablak: "Ablak",
  erkelyajto: "Erkélyajtó",
  "bejárati_ajto": "Bejárati ajtó",
  toloajto: "Tolóajtó",
  arnyakolas: "Árnyékolás",
  egyeb: "Egyéb",
};

export const PROFIL_CIMKEK: Record<ProfilRendszer, string> = {
  Rehau: "Rehau",
  Gealan: "Gealan",
  Veka: "Veka",
  egyeb: "Egyéb",
};

export const NYITAS_MOD_CIMKEK: Record<NyitasMod, string> = {
  bukonyilo: "Bukó-nyíló",
  nyilo: "Nyíló",
  fix: "Fix",
  tolohato: "Tolható",
  bilego: "Billegő",
  egyeb: "Egyéb",
};

export const NYITAS_IRANY_CIMKEK: Record<NyitasIrany, string> = {
  bal: "Bal",
  jobb: "Jobb",
  mindket: "Mindkét irány",
  na: "N/A",
};

export const UVEGEZÉS_CIMKEK: Record<Uvegezés, string> = {
  "2_retegu": "2 rétegű",
  "3_retegu": "3 rétegű",
  "4_retegu": "4 rétegű",
  biztonsagi: "Biztonsági",
  egyeb: "Egyéb",
};

export const KAPCSOLAT_TIPUS_CIMKEK: Record<KapcsolatTipus, string> = {
  bejovo_erdeklodes: "Bejövő érdeklődés",
  felmeres: "Felmérés",
  visszahivas: "Visszahívás",
  meglevo_ugyfel: "Meglévő ügyfél",
};
