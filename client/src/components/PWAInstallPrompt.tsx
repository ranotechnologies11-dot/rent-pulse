import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setStandalone(isStandalone);
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (standalone || !visible || !installEvent) return null;

  async function install() {
    const promptEvent = installEvent;
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setInstallEvent(null);
  }

  return <div className="fixed inset-x-3 bottom-20 z-[60] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-[#b9ded5] bg-[#f2fbf8] p-3 shadow-[0_18px_45px_rgba(10,70,62,.2)] dark:border-[#35665d] dark:bg-[#183533] sm:bottom-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0b645c] text-white"><Download className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="text-sm font-bold text-[#164945] dark:text-[#e1f5f0]">Install RentPulse</div><p className="text-xs leading-5 text-[#4d746d] dark:text-[#b0ccc6]">Add the landlord workspace to your phone for quick access.</p></div><Button onClick={install} size="sm" className="bg-[#0b645c] text-white hover:bg-[#09564f]">Install</Button><button onClick={() => setVisible(false)} className="rounded-lg p-1 text-[#668b83] hover:bg-black/5 dark:hover:bg-white/10" aria-label="Dismiss install prompt"><X className="h-4 w-4" /></button></div>;
}
