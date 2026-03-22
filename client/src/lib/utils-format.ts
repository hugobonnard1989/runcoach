export function formatPace(paceMinKm: number | null | undefined): string {
  if (!paceMinKm) return "--:--";
  const minutes = Math.floor(paceMinKm);
  const seconds = Math.round((paceMinKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m}min`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function getSessionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    easy_run: "Footing",
    tempo: "Tempo",
    intervals: "Fractionné",
    long_run: "Sortie longue",
    recovery: "Récupération",
    race: "Course",
    rest: "Repos",
    strength: "Renforcement",
    cross_training: "Cross-training",
  };
  return labels[type] || type;
}

export function getSessionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    easy_run: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    tempo: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    intervals: "bg-red-500/15 text-red-600 dark:text-red-400",
    long_run: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    recovery: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    race: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    rest: "bg-gray-500/15 text-gray-500",
    strength: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    cross_training: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  };
  return colors[type] || "bg-gray-500/15 text-gray-500";
}

export function getFeelingLabel(feeling: number | null | undefined): string {
  if (!feeling) return "";
  const labels = ["", "Epuisé", "Dur", "Correct", "Bien", "Excellent"];
  return labels[feeling] || "";
}
