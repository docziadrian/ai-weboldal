import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap, Brain, MessageSquare, LogOut, Hexagon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/chatterblast", label: "ChatterBlast", icon: MessageSquare, color: "text-purple-400" },
    { href: "/dreamweaver", label: "DreamWeaver", icon: Zap, color: "text-yellow-400" },
    { href: "/mindreader", label: "MindReader", icon: Brain, color: "text-cyan-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-64 glass-panel border-r border-white/5 z-20 flex flex-col md:h-screen"
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="relative">
            <Hexagon className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          </div>
          <Link href="/" className="text-xl font-bold font-tech tracking-wider text-white hover:text-primary transition-colors cursor-pointer">
            NEXUS<span className="text-primary">OS</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${location === item.href ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
              `}>
                <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-0 transition-opacity ${location === item.href ? 'opacity-100' : ''}`} />
                <item.icon className={`w-5 h-5 ${location === item.href ? item.color : 'group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={logout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden h-screen">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background pointer-events-none" />

        <div className="relative z-10 h-full overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
