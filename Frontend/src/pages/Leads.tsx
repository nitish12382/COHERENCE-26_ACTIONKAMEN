import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, type LeadStatus } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  industry: string;
  location: string;
  status: LeadStatus;
}

const mockLeads: Lead[] = [
  { id: 1, name: "John Smith", company: "FinTech Corp", email: "john@fintechcorp.com", industry: "FinTech", location: "New York", status: "New" },
  { id: 2, name: "Sarah Johnson", company: "CloudScale AI", email: "sarah@cloudscale.ai", industry: "AI/ML", location: "San Francisco", status: "Contacted" },
  { id: 3, name: "Mike Chen", company: "DataFlow Inc", email: "mike@dataflow.io", industry: "Data", location: "Austin", status: "Replied" },
  { id: 4, name: "Emily Davis", company: "GrowthPulse", email: "emily@growthpulse.com", industry: "Marketing", location: "Chicago", status: "Follow-Up Sent" },
  { id: 5, name: "Alex Rivera", company: "SecureNet", email: "alex@securenet.com", industry: "Cybersecurity", location: "Seattle", status: "Converted" },
  { id: 6, name: "Lisa Wang", company: "PropTech Solutions", email: "lisa@proptech.co", industry: "Real Estate", location: "Miami", status: "New" },
  { id: 7, name: "David Kim", company: "HealthBridge", email: "david@healthbridge.io", industry: "Healthcare", location: "Boston", status: "Contacted" },
  { id: 8, name: "Rachel Green", company: "EduLearn Pro", email: "rachel@edulearn.com", industry: "EdTech", location: "Denver", status: "Replied" },
];

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockLeads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">{mockLeads.length} total leads in database</p>
        </div>
        <Button className="gap-2 self-start">
          <Upload className="h-4 w-4" />
          Upload CSV
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Replied">Replied</SelectItem>
              <SelectItem value="Follow-Up Sent">Follow-Up Sent</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Email</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Industry</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Location</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead, i) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                className="border-border hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{lead.email}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{lead.industry}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{lead.location}</TableCell>
                <TableCell><StatusBadge status={lead.status} /></TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
