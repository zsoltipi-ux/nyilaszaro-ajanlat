/*
 * TetelKartya – individual item card component
 * Design: white card, collapsible, inline editing
 * Shows key fields prominently, secondary fields in expanded view
 */
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Trash2, AlertCircle } from "lucide-react";
import type { Tetel } from "@/lib/types";
import {
  KATEGORIA_CIMKEK,
  PROFIL_CIMKEK,
  NYITAS_MOD_CIMKEK,
  NYITAS_IRANY_CIMKEK,
  UVEGEZÉS_CIMKEK,
} from "@/lib/types";

interface TetelKartyaProps {
  tetel: Tetel;
  index: number;
  onChange: (tetel: Tetel) => void;
  onDelete: () => void;
  onCopy: () => void;
}

const KATEGORIA_OPTIONS = Object.entries(KATEGORIA_CIMKEK);
const PROFIL_OPTIONS = Object.entries(PROFIL_CIMKEK);
const NYITAS_MOD_OPTIONS = Object.entries(NYITAS_MOD_CIMKEK);
const NYITAS_IRANY_OPTIONS = Object.entries(NYITAS_IRANY_CIMKEK);
const UVEGEZÉS_OPTIONS = Object.entries(UVEGEZÉS_CIMKEK);

const SZIN_OPTIONS = [
  "Fehér", "Antracit", "Barna", "Arany tölgy", "Tölgy", "Dió",
  "Szürke", "Fekete", "Golden oak", "Winchester", "Egyéb",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>;
}

function FieldInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white ${className}`}
    />
  );
}

function FieldSelect({
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
      className="w-full text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-[oklch(0.32_0.09_152)] focus:ring-[oklch(0.32_0.09_152)]/30 w-3.5 h-3.5"
      />
      <span className="text-xs text-gray-600">{label}</span>
    </label>
  );
}

export default function TetelKartya({
  tetel,
  index,
  onChange,
  onDelete,
  onCopy,
}: TetelKartyaProps) {
  const [expanded, setExpanded] = useState(true);

  const update = (field: keyof Tetel, value: unknown) => {
    onChange({ ...tetel, [field]: value });
  };

  const hasValidationError = !tetel.kategoria || !tetel.szelesseg || !tetel.magassag;

  const kategoriaLabel = tetel.kategoria
    ? KATEGORIA_CIMKEK[tetel.kategoria as keyof typeof KATEGORIA_CIMKEK] || tetel.kategoria
    : "Nincs kategória";

  const meret =
    tetel.szelesseg && tetel.magassag
      ? `${tetel.szelesseg}×${tetel.magassag} mm`
      : "Méret hiányzik";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[oklch(0.32_0.09_152)] text-white text-xs font-bold flex-shrink-0">
            {index}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 font-[Figtree]">
                {kategoriaLabel}
              </span>
              {hasValidationError && (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <div className="text-xs text-gray-500">
              {tetel.darabszam || 1} db · {meret}
              {tetel.szin ? ` · ${tetel.szin}` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Másolás"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Törlés"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Row 1: Category, Profile, Quantity */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel>Kategória *</FieldLabel>
              <FieldSelect
                value={tetel.kategoria}
                onChange={(v) => update("kategoria", v)}
                options={KATEGORIA_OPTIONS}
                placeholder="Kategória..."
              />
            </div>
            <div>
              <FieldLabel>Profilrendszer</FieldLabel>
              <FieldSelect
                value={tetel.profilRendszer}
                onChange={(v) => update("profilRendszer", v)}
                options={PROFIL_OPTIONS}
                placeholder="Profil..."
              />
            </div>
            <div>
              <FieldLabel>Darabszám</FieldLabel>
              <FieldInput
                type="number"
                value={tetel.darabszam}
                onChange={(v) => update("darabszam", v)}
                placeholder="1"
              />
            </div>
          </div>

          {/* Row 2: Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Szélesség (mm) *</FieldLabel>
              <FieldInput
                type="number"
                value={tetel.szelesseg}
                onChange={(v) => update("szelesseg", v)}
                placeholder="pl. 1200"
              />
            </div>
            <div>
              <FieldLabel>Magasság (mm) *</FieldLabel>
              <FieldInput
                type="number"
                value={tetel.magassag}
                onChange={(v) => update("magassag", v)}
                placeholder="pl. 1500"
              />
            </div>
          </div>

          {/* Row 3: Opening mode, direction, color */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel>Nyitásmód</FieldLabel>
              <FieldSelect
                value={tetel.nyitasMod}
                onChange={(v) => update("nyitasMod", v)}
                options={NYITAS_MOD_OPTIONS}
                placeholder="Nyitásmód..."
              />
            </div>
            <div>
              <FieldLabel>Nyitásirány</FieldLabel>
              <FieldSelect
                value={tetel.nyitasIrany}
                onChange={(v) => update("nyitasIrany", v)}
                options={NYITAS_IRANY_OPTIONS}
                placeholder="Irány..."
              />
            </div>
            <div>
              <FieldLabel>Szín</FieldLabel>
              <select
                value={tetel.szin}
                onChange={(e) => update("szin", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white"
              >
                <option value="">Szín...</option>
                {SZIN_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Glazing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Üvegezés</FieldLabel>
              <FieldSelect
                value={tetel.uvegezés}
                onChange={(v) => update("uvegezés", v)}
                options={UVEGEZÉS_OPTIONS}
                placeholder="Üvegezés..."
              />
            </div>
            <div>
              <FieldLabel>Egyéb kiegészítők</FieldLabel>
              <FieldInput
                value={tetel.egyebKiegeszitok}
                onChange={(v) => update("egyebKiegeszitok", v)}
                placeholder="pl. biztonsági zár, könyöklő..."
              />
            </div>
          </div>

          {/* Row 5: Checkboxes */}
          <div className="flex flex-wrap gap-4 pt-1">
            <Checkbox
              checked={tetel.parkany}
              onChange={(v) => update("parkany", v)}
              label="Párkány"
            />
            <Checkbox
              checked={tetel.redony}
              onChange={(v) => update("redony", v)}
              label="Redőny"
            />
            <Checkbox
              checked={tetel.szunyoghalo}
              onChange={(v) => update("szunyoghalo", v)}
              label="Szúnyogháló"
            />
          </div>

          {/* Row 6: Internal note */}
          <div>
            <FieldLabel>Belső megjegyzés</FieldLabel>
            <textarea
              value={tetel.belsomegjegyzes}
              onChange={(e) => update("belsomegjegyzes", e.target.value)}
              placeholder="Belső megjegyzés a tételhez..."
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[oklch(0.32_0.09_152)]/30 focus:border-[oklch(0.32_0.09_152)] bg-white resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
