import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Search, Filter, Loader2, ArrowLeft, Users, FolderOpen } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { leadsApi, type Lead, type BatchInfo } from "@/lib/api";

const fmt = (b: string) => b.replace("batch_", "Batch ");

const CARD_COLOURS = [
  "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  "from-rose-500/20 to-rose-600/10 border-rose-500/30",
  "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
];
const ICON_COLOURS = [
  "text-blue-400", "text-purple-400", "text-emerald-400",
  "text-amber-400", "text-rose-400", "text-cyan-400",
];

export default function Leads() {
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState<BatchInfo | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [nextBatch, setNextBatch] = useState("batch_1");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBatches = async () => {
    setIsLoadingBatches(true);
    try { setBatches(await leadsApi.getBatches()); }
    catch (err: unknown) { toast.error((err as Error).message); }
    finally { setIsLoadingBatches(false); }
  };

  useEffect(() => { loadBatches(); }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    const t = setTimeout(async () => {
      setIsLoadingLeads(true);
      try {
        const res = await leadsApi.list({ batch: selectedBatch.batch, search: search || undefined, status: statusFilter });
        setLeads(res.leads); setTotal(res.total);
      } catch (err: unknown) { toast.error((err as Error).message); }
      finally { setIsLoadingLeads(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [selectedBatch, search, statusFilter]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    try { const res = await leadsApi.getNextBatch(); setNextBatch(res.batch); }
    catch { setNextBatch(`batch_${batches.length + 1}`); }
    setDialogOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    setDialogOpen(false);
    setIsUploading(true);
    try {
      const res = await leadsApi.uploadCSV(pendingFile, description.trim());
      toast.success(`${res.message} â†’ ${fmt(res.batch)}`);
      await loadBatches();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Upload failed");
    } finally {
      setIsUploading(false); setPendingFile(null); setDescription("");
    }
  };

  const handleBack = () => { setSelectedBatch(null); setLeads([]); setSearch(""); setStatusFilter("all"); };

  const uploadTrigger = (
    <>
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
      <Button className="gap-2 self-start" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isUploading ? "Uploadingâ€¦" : "Upload CSV"}
      </Button>
    </>
  );

  const uploadDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CSV / Excel</DialogTitle>
          <DialogDescription>
            This file will be saved as <strong>{fmt(nextBatch)}</strong> (auto-assigned).
            Add a short description so you can identify these leads later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Batch</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm font-semibold">
              <FolderOpen className="h-4 w-4 text-primary" />
              {fmt(nextBatch)}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="csv-desc">Description</Label>
            <Input
              id="csv-desc"
              placeholder='e.g. "HR outreach Q2" or "Finance leads"'
              value={description}
              maxLength={60}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirmUpload(); }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">2â€“5 words to describe this audience</p>
          </div>
          {pendingFile && (
            <p className="text-xs text-muted-foreground border rounded-md px-3 py-2">
              ðŸ“„ {pendingFile.name} Â· {(pendingFile.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setDialogOpen(false); setPendingFile(null); }}>Cancel</Button>
          <Button onClick={handleConfirmUpload} disabled={!description.trim()}>
            <Upload className="h-4 w-4 mr-2" />Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // â”€â”€ VIEW A: Batch cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!selectedBatch) {
    return (
      <div className="space-y-6 max-w-7xl">
        {uploadDialog}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-1">
              {isLoadingBatches ? "Loadingâ€¦"
                : `${batches.length} batch${batches.length !== 1 ? "es" : ""} Â· ${batches.reduce((s, b) => s + b.count, 0).toLocaleString()} total leads`}
            </p>
          </div>
          {uploadTrigger}
        </motion.div>

        {isLoadingBatches ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : batches.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-16 text-center text-muted-foreground">
            <Upload className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No batches yet</p>
            <p className="text-sm mt-1">Upload a CSV file to create your first batch of leads.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b, i) => (
              <motion.button key={b.batch} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} onClick={() => setSelectedBatch(b)}
                className={`glass-card p-6 text-left border bg-gradient-to-br ${CARD_COLOURS[i % CARD_COLOURS.length]} hover:scale-[1.02] active:scale-[0.99] transition-transform cursor-pointer w-full`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg bg-background/50 flex items-center justify-center ${ICON_COLOURS[i % ICON_COLOURS.length]}`}>
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{b.batch}</span>
                </div>
                <h3 className="text-lg font-bold">{fmt(b.batch)}</h3>
                {b.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{b.description}</p>}
                <div className="flex items-center gap-1.5 mt-4 text-sm font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{b.count.toLocaleString()} leads</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // â”€â”€ VIEW B: Lead table inside selected batch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6 max-w-7xl">
      {uploadDialog}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />All Batches
          </Button>
          <div className="h-5 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{fmt(selectedBatch.batch)}</h1>
            {selectedBatch.description && <p className="text-sm text-muted-foreground">{selectedBatch.description}</p>}
          </div>
        </div>
        {uploadTrigger}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leadsâ€¦" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter status" />
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

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm text-muted-foreground">
          {isLoadingLeads ? "Loadingâ€¦" : `${total.toLocaleString()} lead${total !== 1 ? "s" : ""}`}
        </div>
        {isLoadingLeads ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Email</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Industry</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Location</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden xl:table-cell text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No leads found in this batch.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead, i) => (
                  <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.02 * i }}
                    className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{lead.email}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{lead.industry}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{lead.location}</TableCell>
                    <TableCell><StatusBadge status={lead.status as LeadStatus} /></TableCell>
                    <TableCell className="hidden xl:table-cell text-right">
                      {lead.score != null
                        ? <span className={`font-semibold ${lead.score >= 70 ? "text-green-500" : lead.score >= 40 ? "text-yellow-500" : "text-muted-foreground"}`}>{lead.score}</span>
                        : <span className="text-muted-foreground">â€”</span>}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
