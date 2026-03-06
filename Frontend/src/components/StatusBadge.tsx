import { Badge } from "@/components/ui/badge";

type LeadStatus = "New" | "Contacted" | "Replied" | "Follow-Up Sent" | "Converted";

const statusStyles: Record<LeadStatus, string> = {
  "New": "bg-status-new/15 text-status-new border-status-new/30",
  "Contacted": "bg-status-contacted/15 text-status-contacted border-status-contacted/30",
  "Replied": "bg-status-replied/15 text-status-replied border-status-replied/30",
  "Follow-Up Sent": "bg-status-followup/15 text-status-followup border-status-followup/30",
  "Converted": "bg-status-converted/15 text-status-converted border-status-converted/30",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={`text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </Badge>
  );
}

export type { LeadStatus };
