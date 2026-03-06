import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { campaignsApi, type Campaign } from "@/lib/api";

const statusConfig = {
  active: { label: "Active", className: "bg-status-replied/15 text-status-replied border-status-replied/30" },
  paused: { label: "Paused", className: "bg-status-contacted/15 text-status-contacted border-status-contacted/30" },
  completed: { label: "Completed", className: "bg-status-converted/15 text-status-converted border-status-converted/30" },
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () =>
    campaignsApi
      .list()
      .then(setCampaigns)
      .catch((e: unknown) => toast.error((e as Error).message))
      .finally(() => setIsLoading(false));

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "pause" | "resume" | "stop") => {
    setActionId(id);
    try {
      let updated: Campaign;
      if (action === "pause") updated = await campaignsApi.pause(id);
      else if (action === "resume") updated = await campaignsApi.resume(id);
      else updated = await campaignsApi.stop(id);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(`Campaign ${action}d`);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your outreach campaigns</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Create campaign coming soon")}>          
          <Play className="h-4 w-4" />
          New Campaign
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          No campaigns yet. Create one to get started.
        </div>
      ) : (
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
                    <Badge variant="outline" className={statusConfig[campaign.status]?.className}>
                      {statusConfig[campaign.status]?.label ?? campaign.status}
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
                    <Button variant="ghost" size="sm" disabled={actionId === campaign.id} onClick={() => act(campaign.id, "pause")}>
                      {actionId === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  )}
                  {campaign.status === "paused" && (
                    <Button variant="ghost" size="sm" disabled={actionId === campaign.id} onClick={() => act(campaign.id, "resume")}>
                      {actionId === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    </Button>
                  )}
                  {campaign.status !== "completed" && (
                    <Button variant="ghost" size="sm" disabled={actionId === campaign.id} onClick={() => act(campaign.id, "stop")}>
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
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
      )}
    </div>
  );
}
