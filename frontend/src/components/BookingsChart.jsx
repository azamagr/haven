import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { title, count } = payload[0].payload;
  return (
    <div className="bg-ink text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-medium">{title}</p>
      <p className="font-mono mt-0.5">{count} booking{count === 1 ? "" : "s"}</p>
    </div>
  );
}

export default function BookingsChart({ data }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <h3 className="font-display font-semibold text-lg mb-4">Bookings by listing</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="title"
              tick={{ fontSize: 10, fill: "var(--color-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-line)" }}
              tickFormatter={(t) => (t.length > 12 ? `${t.slice(0, 12)}…` : t)}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted)" }} tickLine={false} axisLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-bg)" }} />
            <Bar dataKey="count" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
