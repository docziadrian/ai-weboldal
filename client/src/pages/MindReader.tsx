import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Brain, Upload, Scan, FileImage, Loader2, AlertCircle } from "lucide-react";
import { useAnalyzeImage } from "@/hooks/use-mindreader";
import { Button } from "@/components/ui/button";
import { RecognitionResult } from "@shared/schema";

export default function MindReader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  
  const analyze = useAnalyzeImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null); // Reset previous result
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    analyze.mutate(formData, {
      onSuccess: (data) => {
        setResult(data);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
          <Brain className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">MIND<span className="text-cyan-400">READER</span></h1>
        <p className="text-muted-foreground max-w-xl mx-auto font-tech">
          Upload imagery for computer vision analysis and object detection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6"
        >
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
              ${selectedFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/5'}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
            
            {selectedFile ? (
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-2">
                  <FileImage className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="font-medium text-cyan-100">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p className="text-xs text-cyan-400 mt-2">Click to change</p>
              </div>
            ) : (
              <div className="text-center space-y-2 group-hover:scale-105 transition-transform">
                <Upload className="w-10 h-10 text-muted-foreground mb-2 mx-auto group-hover:text-cyan-400 transition-colors" />
                <p className="font-medium text-muted-foreground group-hover:text-white">Drop image or click to browse</p>
                <p className="text-xs text-muted-foreground/50">Supports JPG, PNG, WEBP</p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedFile || analyze.isPending}
            className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-tech text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all"
          >
            {analyze.isPending ? (
              <><Loader2 className="mr-2 animate-spin" /> SCANNING...</>
            ) : (
              <><Scan className="mr-2" /> INITIATE ANALYSIS</>
            )}
          </Button>

          {result && (
            <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold font-tech">
                <AlertCircle className="w-4 h-4" />
                ANALYSIS COMPLETE
              </div>
              <p className="text-sm text-cyan-100/80">
                Detected <span className="text-white font-bold">{result.objectCount}</span> objects with high confidence.
              </p>
            </div>
          )}
        </motion.div>

        {/* Preview / Result Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-2 rounded-2xl border border-white/10 min-h-[400px] relative overflow-hidden flex items-center justify-center bg-black/40"
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className={`w-full h-auto rounded-xl ${analyze.isPending ? 'opacity-50 blur-sm' : ''} transition-all duration-500`}
              />
              
              {/* Scanning Overlay Animation */}
              {analyze.isPending && (
                <div className="absolute inset-0 animate-scanline z-10" />
              )}

              {/* Bounding Boxes */}
              {result && result.objects.map((obj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    left: `${obj.box.x}px`,
                    top: `${obj.box.y}px`,
                    width: `${obj.box.width}px`,
                    height: `${obj.box.height}px`,
                  }}
                  className="absolute border-2 border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.4)] z-20"
                >
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t-sm uppercase tracking-wider whitespace-nowrap shadow-sm">
                    {obj.label} {Math.round(obj.score * 100)}%
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground/50">
              <Scan className="w-16 h-16 mx-auto opacity-30 mb-4" />
              <p className="font-tech tracking-widest text-sm">NO SIGNAL INPUT</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
