const SYSTEM_FONTS = new Set([
  "arial",
  "helvetica",
  "verdana",
  "georgia",
  "times new roman",
  "courier new",
  "trebuchet ms",
  "impact",
  "comic sans ms",
  "tahoma",
  "system-ui",
  "sans-serif",
  "serif",
  "monospace",
]);

export function loadGoogleFont(name: string): void {
  if (typeof document === "undefined") return;
  if (SYSTEM_FONTS.has(name.toLowerCase())) return;

  const id = `embed-font-${name.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}
