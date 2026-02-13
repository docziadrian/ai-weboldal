import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="glass-panel p-12 rounded-2xl border border-destructive/30 text-center max-w-md shadow-[0_0_50px_rgba(239,68,68,0.15)]">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold mb-2 font-tech text-destructive tracking-widest">404 ERROR</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Neural pathway not found. The requested sector does not exist or has been corrupted.
        </p>

        <Link href="/" className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all text-white font-medium tracking-wide font-tech uppercase">
          Return to Nexus
        </Link>
      </div>
    </div>
  );
}
