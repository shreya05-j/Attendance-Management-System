import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({ children, className = "", padding = "md", hover = false }: CardProps) {
  const paddings = { sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div
      className={`rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm ${
        paddings[padding]
      } ${hover ? "hover:shadow-md transition-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  color = "indigo",
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: "indigo" | "green" | "yellow" | "red" | "blue" | "purple";
}) {
  const colorMap = {
    indigo: "bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-50/80 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    red: "bg-red-50/80 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    blue: "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${colorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
