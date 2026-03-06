import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, MessageSquare, CheckCircle, Plus, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { workflowsApi, type Workflow, type WorkflowStep } from "@/lib/api";
import { LucideIcon } from "lucide-react";

const stepColors: Record<string, string> = {
  email: "border-primary bg-primary/5",
  wait: "border-status-contacted bg-status-contacted/5",
  followup: "border-status-followup bg-status-followup/5",
  condition: "border-status-replied bg-status-replied/5",
};

const iconColors: Record<string, string> = {
  email: "text-primary",
  wait: "text-status-contacted",
  followup: "text-status-followup",
  condition: "text-status-replied",
};

const stepIcons: Record<string, LucideIcon> = {
  email: Mail,
  wait: Clock,
  followup: MessageSquare,
  condition: CheckCircle,
};

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    workflowsApi
      .list()
      .then(setWorkflows)
      .catch((e: unknown) => toast.error((e as Error).message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">Build and manage outreach automation sequences</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Workflow builder coming soon")}>
          <Plus className="h-4 w-4" />
          New Workflow
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          No workflows yet. Create one to automate your outreach.
        </div>
      ) : (
        workflows.map((workflow, wi) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + wi * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">{workflow.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {workflow.steps.length} steps
                  {workflow.target_audience ? ` · ${workflow.target_audience}` : ""}
                </p>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-status-replied/15 text-status-replied border border-status-replied/30 capitalize">
                {workflow.status}
              </span>
            </div>

            <div className="flex flex-col items-center gap-0">
              {workflow.steps.map((step: WorkflowStep, i: number) => {
                const Icon = stepIcons[step.type] ?? Mail;
                return (
                  <div key={i} className="flex flex-col items-center w-full max-w-md mx-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      className={`w-full border-l-4 rounded-lg p-4 flex items-center gap-4 ${stepColors[step.type] ?? "border-border bg-muted/5"}`}
                    >
                      <div className={`h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0 ${iconColors[step.type] ?? ""}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.detail}</p>
                      </div>
                    </motion.div>
                    {i < workflow.steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="py-1"
                      >
                        <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
