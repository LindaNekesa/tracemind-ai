"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

interface DataPoint { name: string; value: number }

interface ChartProps {
  data?: DataPoint[];
  type?: "line" | "bar";
  title?: string;
}

const fallback: DataPoint[] = [
  { name: "Jan", value: 0 },
  { name: "Feb", value: 0 },
  { name: "Mar", value: 0 },
];

export default function ChartComponent({ data = fallback, type = "line", title }: ChartProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      {title && <h3 className="font-semibold text-gray-700 mb-4">{title}</h3>}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
