import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Users, Mail, MessageSquare, CalendarCheck, TrendingUp, Target, Loader2 } from "lucide-react";
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
import { analyticsApi, type DashboardStats, type ReplyTrendPoint, type FunnelPoint } from "@/lib/api";
import { toast } from "sonner";

export default function Analytics() {
  const [dashData, setDashData] = useState<DashboardStats | null>(null);
  const [replyData, setReplyData] = useState<ReplyTrendPoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.dashboard(),
      analyticsApi.replyTrend(),
      analyticsApi.funnel(),
    ])
      .then(([dash, trend, funnel]) => {
        setDashData(dash);
        setReplyData(trend);
        setFunnelData(funnel);
      })
      .catch((e: unknown) => toast.error((e as Error).message))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = dashData
    ? [
        { title: "Total Leads", value: dashData.stats.total_leads.toLocaleString(), change: "All-time", changeType: "positive" as const, icon: Users },
        { title: "Emails Sent", value: dashData.campaign_performance.reduce((s, c) => s + c.sent, 0).toLocaleString(), change: "Across campaigns", changeType: "positive" as const, icon: Mail },
        { title: "Replies Received", value: String(dashData.stats.replies_received), change: "Total replies", changeType: "positive" as const, icon: MessageSquare },
        { title: "Active Campaigns", value: String(dashData.stats.active_campaigns), change: "Currently running", changeType: "neutral" as const, icon: CalendarCheck },
        { title: "Conversion Rate", value: `${dashData.stats.conversion_rate}%`, change: "Leads → Converted", changeType: "positive" as const, icon: TrendingUp },
        { title: "Avg Reply Rate", value: dashData.campaign_performance.length > 0
          ? `${(dashData.campaign_performance.reduce((s, c) => s + c.rate, 0) / dashData.campaign_performance.length).toFixed(1)}%`
          : "0%", change: "Across campaigns", changeType: "positive" as const, icon: Target },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your outreach performance and metrics</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
