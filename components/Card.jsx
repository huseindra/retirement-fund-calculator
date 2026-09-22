export default function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`rounded-xl border border-border bg-surface p-6 sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
