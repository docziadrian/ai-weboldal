import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Download, Maximize, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { useGenerateImage, useImageJob } from "@/hooks/use-dreamweaver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function DreamWeaver() {
  const [prompt, setPrompt] = useState("");
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  
  const generate = useGenerateImage();
  const { data: job, isLoading: isJobLoading } = useImageJob(currentJobId);
  const { toast } = useToast();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    generate.mutate(prompt, {
      onSuccess: (data) => setCurrentJobId(data.id),
    });
  };

  // Mock progress simulation for UI delight since backend update is polled
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    if (job?.status === 'pending' || job?.status === 'processing') {
      const interval = setInterval(() => {
        setVisualProgress(prev => {
          // Approach actual progress, but don't exceed it too much if we had real progress
          const target = job.progress || 0;
          return prev < target ? prev + 1 : (prev < 90 ? prev + 0.5 : prev);
        });
      }, 100);
      return () => clearInterval(interval);
    } else if (job?.status === 'completed') {
      setVisualProgress(100);
    } else {
      setVisualProgress(0);
    }
  }, [job]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <Zap className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">DREAM<span className="text-yellow-400">WEAVER</span></h1>
        <p className="text-muted-foreground max-w-xl mx-auto font-tech">
          Enter a descriptive prompt to synthesize visual data from the neural latent space.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Controls Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6"
        >
          <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground uppercase font-tech tracking-wider">
              Visual Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cyberpunk city street at night, neon lights, rain, reflections, high detail..."
              className="w-full h-40 cyber-input rounded-xl p-4 resize-none bg-black/40 focus:ring-yellow-500/50 focus:border-yellow-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs text-muted-foreground font-tech">
              <span>MODEL: SD-XL-TURBO</span>
              <span>VER: 2.1.0</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500/50 w-2/3" />
            </div>
          </div>

          <div className="mt-auto">
            <Button
              onClick={handleGenerate}
              disabled={generate.isPending || (job?.status === 'processing')}
              className="w-full h-14 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Generate
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </div>
        </motion.div>

        {/* Display Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center bg-black/40"
        >
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px]" />
          
          {!job ? (
            <div className="text-center text-muted-foreground/50 space-y-4">
              <ImageIcon className="w-16 h-16 mx-auto opacity-50" />
              <p className="font-tech tracking-widest text-sm">AWAITING INPUT DATA</p>
            </div>
          ) : job.status === 'processing' || job.status === 'pending' ? (
            <div className="w-full max-w-md p-8 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-2 border-4 border-t-yellow-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1s_linear_infinite]" />
                <Zap className="absolute inset-0 m-auto w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-yellow-500/80">
                  <span>PROCESSING...</span>
                  <span>{Math.round(visualProgress)}%</span>
                </div>
                <Progress value={visualProgress} className="h-2 bg-white/5 text-yellow-500" indicatorClassName="bg-yellow-500" />
              </div>
            </div>
          ) : job.status === 'failed' ? (
            <div className="text-red-400 font-tech">GENERATION FAILED</div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full h-full group"
            >
              {job.imageUrl && (
                <img 
                  src={job.imageUrl} 
                  alt="Generated" 
                  className="w-full h-full object-contain p-2"
                />
              )}
              
              {/* Overlay Actions */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white">
                  <Maximize className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => {
                    toast({ title: "Downloading", description: "Asset saved to local drive." });
                  }}
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full h-12 w-12 bg-yellow-500 hover:bg-yellow-400 text-black border-none"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
