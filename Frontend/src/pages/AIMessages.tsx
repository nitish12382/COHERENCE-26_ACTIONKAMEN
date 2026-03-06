import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { messagesApi, type MessageRequest } from "@/lib/api";

export default function AIMessages() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<MessageRequest["tone"]>("professional");
  const [goal, setGoal] = useState<MessageRequest["goal"]>("book-meeting");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await messagesApi.generate({ prompt, tone, goal });
      setGeneratedMessage(res.message);
      toast.success("Message generated!");
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Generation failed";
      if (msg.includes("GROQ_API_KEY")) {
        toast.error("Add your GROQ_API_KEY to backend/.env and restart the server");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold tracking-tight">AI Messages</h1>
        <p className="text-muted-foreground mt-1">Generate personalized outreach messages with AI</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Configuration</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Prompt</label>
            <Textarea
              placeholder="e.g., Generate outreach message for SaaS founders to book product demo..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tone</label>
              <Select value={tone} onValueChange={(v) => setTone(v as MessageRequest["tone"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Goal</label>
              <Select value={goal} onValueChange={(v) => setGoal(v as MessageRequest["goal"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="book-meeting">Book Meeting</SelectItem>
                  <SelectItem value="product-intro">Product Intro</SelectItem>
                  <SelectItem value="demo">Schedule Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate Message"}
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Preview</h2>
            {generatedMessage && (
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            )}
          </div>

          {generatedMessage ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="min-h-[280px] resize-none text-sm leading-relaxed"
              />
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              <div className="text-center space-y-2">
                <Sparkles className="h-8 w-8 mx-auto opacity-30" />
                <p>Generated message will appear here</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
