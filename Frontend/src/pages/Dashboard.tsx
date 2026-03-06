import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Rocket, MessageSquare, TrendingUp, Upload, GitBranch, Play, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { analyticsApi, type DashboardStats } from "@/lib/api";
import { toast } from "sonner";

const quickActions = [
  { label: "Upload Leads", icon: Upload, path: "/leads", variant: "default" as const },
  { label: "Create Workflow", icon: GitBranch, path: "/workflows", variant: "secondary" as const },
  { label: "Start Campaign", icon: Play, path: "/campaigns", variant: "secondary" as const },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.dashboard()
      .then(setData)
      .catch((err: unknown) => toast.error((err as Error).message ?? "Failed to load stats"))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = data
    ? [
        { title: "Total Leads", value: data.stats.total_leads.toLocaleString(), change: "All-time total", changeType: "positive" as const, icon: Users },
        { title: "Active Campaigns", value: String(data.stats.active_campaigns), change: "Currently running", changeType: "neutral" as const, icon: Rocket },
        { title: "Replies Received", value: String(data.stats.replies_received), change: "Across all campaigns", changeType: "positive" as const, icon: MessageSquare },
        { title: "Conversion Rate", value: `${data.stats.conversion_rate}%`, change: "Leads → Converted", changeType: "positive" as const, icon: TrendingUp },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your outreach overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="glass-card p-5 h-28 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            ))
          : stats.map((stat, i) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <StatCard {...stat} />
              </motion.div>
            ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="gap-2"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            {isLoading ? (
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : data ? (
              [
                { label: "Total leads in database", value: data.stats.total_leads.toLocaleString() },
                { label: "Active campaigns running", value: data.stats.active_campaigns },
                { label: "Total replies received", value: data.stats.replies_received },
                { label: "Overall conversion rate", value: `${data.stats.conversion_rate}%` },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <p className="text-foreground">{item.label}</p>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </motion.div>
              ))
            ) : null}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Campaign Performance</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : (data?.campaign_performance ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaigns yet. Create one to see performance.</p>
            ) : (
              (data?.campaign_performance ?? []).map((campaign, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{campaign.name}</span>
                    <span className="text-muted-foreground">{campaign.rate}% reply rate</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(campaign.rate * 10, 100)}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
