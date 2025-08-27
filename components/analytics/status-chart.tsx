"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface StatusChartProps {
  data: {
    applied: number
    interview: number
    offer: number
    rejected: number
  }
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = [
    { name: "Applied", value: data.applied, fill: "hsl(var(--chart-1))" },
    { name: "Interview", value: data.interview, fill: "hsl(var(--chart-2))" },
    { name: "Offer", value: data.offer, fill: "hsl(var(--chart-3))" },
    { name: "Rejected", value: data.rejected, fill: "hsl(var(--chart-4))" },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
