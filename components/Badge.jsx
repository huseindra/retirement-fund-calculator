const TONES = {
  positive: "bg-positive-bg text-positive",
  negative: "bg-negative-bg text-negative",
  info: "bg-info-bg text-info",
  neutral: "bg-canvas text-muted border border-border",
};

export default function Badge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
