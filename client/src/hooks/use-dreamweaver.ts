import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ImageJob } from "@shared/schema";

function handleApiError(res: Response) {
  if (res.status === 401) throw new Error("Invalid or expired API token. Please re-enter your token.");
  if (res.status === 403) throw new Error("Billing quota exceeded. Please check your plan.");
  if (res.status === 503) throw new Error("Service temporarily unavailable. Try again later.");
  throw new Error(`Request failed (${res.status})`);
}

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
        handleApiError(res);
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

      if (!res.ok) {
        handleApiError(res);
      }
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
