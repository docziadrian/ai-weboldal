import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Zap, Brain, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AccessTokenDialog from "../components/AccessTokenDialog";

export default function Home() {
  const { token, setToken } = useAuth();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    id: string;
    title: string;
    href: string;
  } | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const services = [
    {
      id: "chatterblast",
      title: "ChatterBlast",
      description: "Neural network interface for natural language processing and conversational synthesis.",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      href: "/chatterblast"
    },
    {
      id: "dreamweaver",
      title: "DreamWeaver",
      description: "Visual cortex simulation engine capable of generating high-fidelity imagery from text.",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      href: "/dreamweaver"
    },
    {
      id: "mindreader",
      title: "MindReader",
      description: "Computer vision analysis module for object detection and scene understanding.",
      icon: Brain,
      color: "from-cyan-400 to-blue-500",
      href: "/mindreader"
    }
  ];

  const handleServiceClick = (service: typeof services[0]) => {
    if (token) {
      // Already have a global API token, navigate directly
      navigate(service.href);
    } else {
      // Show access token dialog
      setSelectedService(service);
      setDialogOpen(true);
    }
  };

  const handleTokenSubmit = (newToken: string) => {
    if (selectedService) {
      setToken(newToken);
      setDialogOpen(false);
      navigate(selectedService.href);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          WELCOME TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">NEXUS</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-tech">
          Select a neural module to begin your session. System status: OPERATIONAL.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {services.map((service) => (
          <motion.div key={service.id} variants={item} className="h-full">
            <div
              onClick={() => handleServiceClick(service)}
              className="block h-full group cursor-pointer"
            >
              <div className="glass-panel h-full p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-2 group-hover:shadow-2xl hover:shadow-primary/20">
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} p-0.5 mb-6 shadow-lg`}>
                  <div className="w-full h-full bg-black/90 rounded-[10px] flex items-center justify-center">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {service.description}
                </p>

                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AccessTokenDialog
        isOpen={dialogOpen}
        serviceName={selectedService?.title ?? ""}
        onSubmit={handleTokenSubmit}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}