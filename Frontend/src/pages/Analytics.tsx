import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Users, Mail, MessageSquare, CalendarCheck, TrendingUp, Target } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const stats = [
  { title: "Leads Contacted", value: "1,847", change: "+234 this week", changeType: "positive" as const, icon: Users },
  { title: "Emails Sent", value: "3,210", change: "+18% from last month", changeType: "positive" as const, icon: Mail },
  { title: "Replies Received", value: "342", change: "10.7% reply rate", changeType: "positive" as const, icon: MessageSquare },
  { title: "Meetings Booked", value: "47", change: "+12 this week", changeType: "positive" as const, icon: CalendarCheck },
  { title: "Conversion Rate", value: "4.2%", change: "+0.3% improvement", changeType: "positive" as const, icon: TrendingUp },
  { title: "Open Rate", value: "58.3%", change: "Above industry avg", changeType: "positive" as const, icon: Target },
];

const replyData = [
  { week: "W1", replies: 24 },
  { week: "W2", replies: 31 },
  { week: "W3", replies: 28 },
  { week: "W4", replies: 42 },
  { week: "W5", replies: 38 },
  { week: "W6", replies: 55 },
  { week: "W7", replies: 49 },
  { week: "W8", replies: 67 },
];

const funnelData = [
  { stage: "Leads", count: 2847 },
  { stage: "Contacted", count: 1847 },
  { stage: "Opened", count: 1076 },
  { stage: "Replied", count: 342 },
  { stage: "Meeting", count: 47 },
  { stage: "Converted", count: 19 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your outreach performance and metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Reply Rate Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={replyData}>
              <defs>
                <linearGradient id="replyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" strokeOpacity={0.3} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 25%, 10%)",
                  border: "1px solid hsl(222, 20%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(220, 14%, 90%)",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="replies" stroke="hsl(217, 91%, 60%)" fill="url(#replyGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" strokeOpacity={0.3} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 25%, 10%)",
                  border: "1px solid hsl(222, 20%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(220, 14%, 90%)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
