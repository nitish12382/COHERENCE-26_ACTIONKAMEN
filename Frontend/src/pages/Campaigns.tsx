import { motion } from "framer-motion";
import { Play, Pause, Square, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: number;
  name: string;
  status: "active" | "paused" | "completed";
  leads: number;
  sent: number;
  replied: number;
  progress: number;
}

const campaigns: Campaign[] = [
  { id: 1, name: "Q1 SaaS Outreach", status: "active", leads: 1200, sent: 890, replied: 67, progress: 74 },
  { id: 2, name: "FinTech Founders", status: "active", leads: 800, sent: 420, replied: 38, progress: 53 },
  { id: 3, name: "Enterprise Pilot", status: "paused", leads: 350, sent: 200, replied: 22, progress: 57 },
  { id: 4, name: "AI Startup Outreach", status: "completed", leads: 500, sent: 500, replied: 45, progress: 100 },
];

const statusConfig = {
  active: { label: "Active", className: "bg-status-replied/15 text-status-replied border-status-replied/30" },
  paused: { label: "Paused", className: "bg-status-contacted/15 text-status-contacted border-status-contacted/30" },
  completed: { label: "Completed", className: "bg-status-converted/15 text-status-converted border-status-converted/30" },
};

export default function Campaigns() {
  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your outreach campaigns</p>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          New Campaign
        </Button>
      </motion.div>

      <div className="grid gap-4">
        {campaigns.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <Badge variant="outline" className={statusConfig[campaign.status].className}>
                    {statusConfig[campaign.status].label}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{campaign.leads} leads</span>
                  <span>{campaign.sent} sent</span>
                  <span>{campaign.replied} replies</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {campaign.status === "active" && (
                  <Button variant="ghost" size="sm"><Pause className="h-4 w-4" /></Button>
                )}
                {campaign.status === "paused" && (
                  <Button variant="ghost" size="sm"><Play className="h-4 w-4" /></Button>
                )}
                <Button variant="ghost" size="sm"><Square className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{campaign.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${campaign.progress}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
