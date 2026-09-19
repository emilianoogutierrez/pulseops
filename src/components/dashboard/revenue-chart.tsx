"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
type Point = { label: string; revenue: number; };
export function RevenueChart({ data }: { data: Point[]; }) {
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height={250}>
    <AreaChart data={data} margin={{ left: -18, right: 10, top: 18, bottom: 0 }}>
      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8d8d86" }}/>
      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8d8d86" }} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}/>
      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString("es-MX")}`, "Collected"]} cursor={{ stroke: "#deded8", strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 10, border: "1px solid #dfdfda", boxShadow: "0 12px 32px rgba(0,0,0,.08)", fontSize: 12 }}/>
      <Area type="monotone" dataKey="revenue" stroke="#246b52" strokeWidth={2.1} fill="#246b52" fillOpacity={0.055} activeDot={{ r: 4, fill: "#246b52", stroke: "white", strokeWidth: 2 }}/>
    </AreaChart>
  </ResponsiveContainer></div>;
}
