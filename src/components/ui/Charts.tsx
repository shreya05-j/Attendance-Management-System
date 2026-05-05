import { Card, CardHeader } from "./Card";
import { ChartSkeleton } from "./Skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Line Chart ─────────────────────────────────────────
interface LineChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  lines: Array<{ key: string; color: string; name: string }>;
  xKey: string;
  loading?: boolean;
  height?: number;
}

export function LineChartCard({ title, subtitle, data, lines, xKey, loading, height = 260 }: LineChartProps) {
  if (loading) return <ChartSkeleton />;

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div style={{ height }}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
              <Legend />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  name={line.name}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// ─── Bar Chart ──────────────────────────────────────────
interface BarChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  bars: Array<{ key: string; color: string; name: string }>;
  xKey: string;
  loading?: boolean;
  height?: number;
}

export function BarChartCard({ title, subtitle, data, bars, xKey, loading, height = 260 }: BarChartProps) {
  if (loading) return <ChartSkeleton />;

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div style={{ height }}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
              <Legend />
              {bars.map((bar) => (
                <Bar key={bar.key} dataKey={bar.key} fill={bar.color} name={bar.name} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// ─── Pie Chart ──────────────────────────────────────────
interface PieChartProps {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number; color: string }>;
  loading?: boolean;
  height?: number;
}

export function PieChartCard({ title, subtitle, data, loading, height = 260 }: PieChartProps) {
  if (loading) return <ChartSkeleton />;

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div style={{ height }}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// ─── Progress Bar ───────────────────────────────────────
interface ProgressBarProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  color?: string;
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, size = "md", color = "#4f46e5", label, showPercent = true }: ProgressBarProps) {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1">
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercent && <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`w-full rounded-full bg-gray-200 dark:bg-gray-700 ${heights[size]}`}>
        <div
          className={`rounded-full transition-all duration-500 ease-out ${heights[size]}`}
          style={{ width: `${clampedValue}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
