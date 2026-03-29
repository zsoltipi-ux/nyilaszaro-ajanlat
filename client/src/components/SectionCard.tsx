/*
 * SectionCard – reusable section wrapper
 * Design: white card, green left accent border, subtle shadow
 * Used throughout the quotation form
 */
import React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export default function SectionCard({
  title,
  subtitle,
  icon,
  children,
  className,
  badge,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100",
        "border-l-4 border-l-[oklch(0.32_0.09_152)]",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="text-[oklch(0.32_0.09_152)] flex-shrink-0">
                {icon}
              </span>
            )}
            <div>
              <h2 className="text-base font-semibold text-gray-800 font-[Figtree]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
