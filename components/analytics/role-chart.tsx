"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RoleChartProps {
  data: { [key: string]: number }
}

export function RoleChart({ data }: RoleChartProps) {
  const chartData = Object.entries(data).map(([role, count], index) => ({
    name: role,
    value: count,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
