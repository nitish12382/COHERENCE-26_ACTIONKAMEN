import { motion } from "framer-motion";
import { Mail, Clock, MessageSquare, CheckCircle, Plus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowStep {
  id: number;
  type: "email" | "wait" | "followup" | "condition";
  label: string;
  detail: string;
  icon: typeof Mail;
}

const sampleWorkflow: WorkflowStep[] = [
  { id: 1, type: "email", label: "Send Initial Email", detail: "Personalized AI outreach", icon: Mail },
  { id: 2, type: "wait", label: "Wait 2 Days", detail: "Pause before follow-up", icon: Clock },
  { id: 3, type: "followup", label: "Send Follow-Up", detail: "If no reply received", icon: MessageSquare },
  { id: 4, type: "wait", label: "Wait 3 Days", detail: "Final wait period", icon: Clock },
  { id: 5, type: "condition", label: "Check Reply", detail: "Stop if replied, else continue", icon: CheckCircle },
];

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

export default function Workflows() {
  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">Build and manage outreach automation sequences</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Workflow
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">SaaS Founder Outreach</h2>
            <p className="text-sm text-muted-foreground">5 steps · Targets SaaS founders for product demo</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-status-replied/15 text-status-replied border border-status-replied/30">
            Active
          </span>
        </div>

        <div className="flex flex-col items-center gap-0">
          {sampleWorkflow.map((step, i) => (
            <div key={step.id} className="flex flex-col items-center w-full max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className={`w-full border-l-4 rounded-lg p-4 flex items-center gap-4 ${stepColors[step.type]}`}
              >
                <div className={`h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0 ${iconColors[step.type]}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                </div>
              </motion.div>
              {i < sampleWorkflow.length - 1 && (
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
          ))}
        </div>
      </motion.div>
    </div>
  );
}
