const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS = {
  primary: "bg-ink text-white px-4 py-2 hover:opacity-90",
  secondary: "border border-border bg-surface text-ink px-3.5 py-1.5 hover:bg-canvas",
  destructive: "border border-border text-negative px-3.5 py-1.5 hover:bg-negative-bg",
};

export function buttonClass(variant = "secondary", className = "") {
  return `${BASE} ${VARIANTS[variant]} ${className}`.trim();
}

export const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-accent";
