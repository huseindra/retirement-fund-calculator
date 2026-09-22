import "./globals.css";

export const metadata = {
  title: "Retirement Fund Calculator",
  description: "Plan, project, and track your retirement savings.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
