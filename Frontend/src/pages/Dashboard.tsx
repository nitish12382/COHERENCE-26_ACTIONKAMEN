import { motion } from "framer-motion";
import { Users, Rocket, MessageSquare, TrendingUp, Upload, GitBranch, Play } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const stats = [
  { title: "Total Leads", value: "2,847", change: "+12.5% from last month", changeType: "positive" as const, icon: Users },
  { title: "Active Campaigns", value: "8", change: "3 launching today", changeType: "neutral" as const, icon: Rocket },
  { title: "Replies Received", value: "342", change: "+8.2% from last week", changeType: "positive" as const, icon: MessageSquare },
  { title: "Conversion Rate", value: "4.2%", change: "+0.3% improvement", changeType: "positive" as const, icon: TrendingUp },
];

const quickActions = [
  { label: "Upload Leads", icon: Upload, path: "/leads", variant: "default" as const },
  { label: "Create Workflow", icon: GitBranch, path: "/workflows", variant: "secondary" as const },
  { label: "Start Campaign", icon: Play, path: "/campaigns", variant: "secondary" as const },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your outreach overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { text: "Campaign 'Q1 SaaS Outreach' sent 120 emails", time: "2 hours ago" },
              { text: "15 new replies received from 'FinTech Founders'", time: "4 hours ago" },
              { text: "Uploaded 500 new leads from CSV", time: "Yesterday" },
              { text: "AI generated 45 personalized messages", time: "Yesterday" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <p className="text-sm text-foreground">{item.text}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Campaign Performance</h2>
          <div className="space-y-4">
            {[
              { name: "Q1 SaaS Outreach", sent: 1200, replied: 89, rate: 7.4 },
              { name: "FinTech Founders", sent: 800, replied: 52, rate: 6.5 },
              { name: "Enterprise Pilot", sent: 350, replied: 31, rate: 8.9 },
            ].map((campaign, i) => (
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
                    animate={{ width: `${campaign.rate * 10}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
