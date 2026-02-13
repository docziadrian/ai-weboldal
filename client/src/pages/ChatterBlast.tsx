import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, Loader2, Bot, User } from "lucide-react";
import { useConversations, useCreateConversation, useMessages, useSendMessage } from "@/hooks/use-chatterblast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "@shared/schema";

// Typewriter effect component for new messages
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const index = useRef(0);

  useEffect(() => {
    // Reset state when text changes completely (new message instance)
    setDisplayedText("");
    index.current = 0;
    
    const interval = setInterval(() => {
      if (index.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, Math.random() * 20 + 5); // Random delay between 5-25ms

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span className="whitespace-pre-wrap">{displayedText}</span>;
}

export default function ChatterBlast() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  
  // Queries & Mutations
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const { data: messages, isLoading: messagesLoading } = useMessages(conversationId);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create conversation on mount if none selected (simplified for this demo)
  useEffect(() => {
    if (!conversationId && !createConversation.isPending) {
      createConversation.mutate(undefined, {
        onSuccess: (data) => setConversationId(data.id),
      });
    }
  }, []); // Only run once

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    sendMessage.mutate({ 
      conversationId, 
      content: inputValue 
    });
    setInputValue("");
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">ChatterBlast v2.0</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-tech uppercase">System Online</span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="bg-transparent border-white/20 hover:bg-white/10 hover:text-white"
          onClick={() => {
            createConversation.mutate(undefined, {
              onSuccess: (data) => setConversationId(data.id)
            });
          }}
          disabled={createConversation.isPending}
        >
          {createConversation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          New Session
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {messagesLoading && conversationId ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !conversationId ? (
          <div className="flex h-full items-center justify-center text-muted-foreground font-tech">
            Initializing neural link...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages?.map((msg: Message, i: number) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
                  ${msg.role === 'user' 
                    ? 'bg-secondary/20 border-secondary/50 text-secondary' 
                    : 'bg-primary/20 border-primary/50 text-primary'}
                `}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div className={`
                  max-w-[80%] rounded-2xl p-4 shadow-lg border relative overflow-hidden group
                  ${msg.role === 'user' 
                    ? 'bg-secondary/10 border-secondary/20 text-foreground rounded-tr-none' 
                    : 'bg-black/60 border-primary/20 text-foreground rounded-tl-none'}
                `}>
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  
                  <div className="relative z-10 leading-relaxed text-sm md:text-base">
                    {msg.role === 'assistant' && i === (messages.length - 1) && !msg.isComplete ? (
                      <TypewriterText text={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter command or message..."
            disabled={sendMessage.isPending || !conversationId}
            className="flex-1 cyber-input h-14 pl-6 pr-12 rounded-xl text-base"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={sendMessage.isPending || !inputValue.trim() || !conversationId}
            className={`
              h-14 w-14 rounded-xl transition-all duration-300
              ${inputValue.trim() ? 'bg-primary hover:bg-primary/80 shadow-[0_0_15px_rgba(255,0,220,0.4)]' : 'bg-muted/50'}
            `}
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
