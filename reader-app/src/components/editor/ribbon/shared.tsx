"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  ToolbarButton                                                      */
/* ------------------------------------------------------------------ */

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export function ToolbarButton({
  icon,
  onClick,
  active,
  disabled,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-accent text-primary"
      )}
    >
      {icon}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  ToolbarDivider                                                     */
/* ------------------------------------------------------------------ */

export function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

/* ------------------------------------------------------------------ */
/*  ToolbarDropdown                                                    */
/* ------------------------------------------------------------------ */

interface ToolbarDropdownProps {
  icon: React.ReactNode;
  label?: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export function ToolbarDropdown({
  icon,
  label,
  children,
  active,
  disabled,
  tooltip,
}: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        title={tooltip}
        className={cn(
          "flex h-7 items-center gap-1 rounded px-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed",
          active && "bg-accent text-primary"
        )}
      >
        {icon}
        {label && <span className="text-xs">{label}</span>}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[130px] rounded-md border border-border bg-popover p-1 shadow-md">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RibbonGroup                                                        */
/* ------------------------------------------------------------------ */

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
}

export function RibbonGroup({ label, children }: RibbonGroupProps) {
  return (
    <div className="ribbon-group">
      <div className="ribbon-group-content">{children}</div>
      <span className="ribbon-group-label">{label}</span>
    </div>
  );
}
