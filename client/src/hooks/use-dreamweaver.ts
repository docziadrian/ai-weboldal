import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";
import { ImageJob } from "@shared/schema";

export function useGenerateImage() {
  const { authHeaders } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch(api.dreamweaver.generate.path, {
        method: api.dreamweaver.generate.method,
        headers: { 
          "Content-Type": "application/json",
          ...authHeaders() 
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Generation failed");
      }
      return await res.json() as ImageJob;
    },
    onError: (err: any) => {
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useImageJob(id: number | null) {
  const { authHeaders } = useAuth();

  return useQuery({
    queryKey: [api.dreamweaver.getStatus.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.dreamweaver.getStatus.path, { id });
      const res = await fetch(url, {
        headers: { ...authHeaders() },
      });

      if (!res.ok) throw new Error("Failed to fetch job status");
      return await res.json() as ImageJob;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        return false;
      }
      return 2000; // Poll every 2s
    },
  });
}
