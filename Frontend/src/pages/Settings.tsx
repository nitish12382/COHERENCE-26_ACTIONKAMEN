import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
    }
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences</p>
      </div>

      <div className="glass-card p-6 max-w-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dark ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                {dark ? "Dark theme is active" : "Light theme is active"}
              </p>
            </div>
          </div>
          <Switch checked={dark} onCheckedChange={setDark} />
        </div>
      </div>
    </div>
  );
}
