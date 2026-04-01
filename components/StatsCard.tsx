interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: "blue" | "green" | "yellow" | "purple" | "red" | "indigo" | "cyan";
  sub?: string;
  trend?: { value: number; label: string };
}

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-500/10",     icon: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",   text: "text-blue-700 dark:text-blue-400",   border: "border-blue-100 dark:border-blue-500/20" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20" },
  yellow: { bg: "bg-amber-50 dark:bg-amber-500/10",   icon: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",   text: "text-amber-700 dark:text-amber-400",   border: "border-amber-100 dark:border-amber-500/20" },
  purple: { bg: "bg-violet-50 dark:bg-violet-500/10", icon: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400", text: "text-violet-700 dark:text-violet-400", border: "border-violet-100 dark:border-violet-500/20" },
  red:    { bg: "bg-red-50 dark:bg-red-500/10",       icon: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",       text: "text-red-700 dark:text-red-400",       border: "border-red-100 dark:border-red-500/20" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", icon: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-500/20" },
  cyan:   { bg: "bg-cyan-50 dark:bg-cyan-500/10",     icon: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",     text: "text-cyan-700 dark:text-cyan-400",     border: "border-cyan-100 dark:border-cyan-500/20" },
};

export default function StatsCard({ title, value, icon, color = "blue", sub, trend }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 flex items-start gap-4 transition hover:shadow-md`}>
      <div className={`${c.icon} w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{title}</p>
        <p className={`text-3xl font-black ${c.text} leading-none`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        {trend && (
          <p className={`text-xs mt-1.5 font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
