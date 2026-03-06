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

const sampleMessages = [
  `Hi John,\n\nI noticed FinTech Corp has been making waves in the financial technology space — congrats on the recent growth!\n\nI'm reaching out because we've helped similar companies automate their outreach and book 3x more product demos. I'd love to show you how it works in a quick 15-minute call.\n\nWould next Tuesday or Wednesday work for you?\n\nBest,\nYour Name`,
  `Hey Sarah,\n\nCloudScale AI's work in ML infrastructure caught my attention — really impressive platform you've built.\n\nWe specialize in helping AI companies streamline their sales pipeline, and I think there's a great fit. Would you be open to a brief chat this week?\n\nLooking forward to connecting!\n\nCheers`,
];

export default function AIMessages() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [goal, setGoal] = useState("book-meeting");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedMessage(sampleMessages[Math.floor(Math.random() * sampleMessages.length)]);
      setIsGenerating(false);
      toast.success("Message generated!");
    }, 1500);
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
              <Select value={tone} onValueChange={setTone}>
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
              <Select value={goal} onValueChange={setGoal}>
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
