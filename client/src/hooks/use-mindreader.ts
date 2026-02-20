import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

function handleApiError(res: Response) {
  if (res.status === 401) throw new Error("Invalid or expired API token. Please re-enter your token.");
  if (res.status === 403) throw new Error("Billing quota exceeded. Please check your plan.");
  if (res.status === 503) throw new Error("Service temporarily unavailable. Try again later.");
  throw new Error(`Request failed (${res.status})`);
}

export function useAnalyzeImage() {
  const { authHeaders } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.mindreader.analyze.path, {
        method: api.mindreader.analyze.method,
        headers: { 
          ...authHeaders() 
          // Note: Content-Type is set automatically for FormData
        },
        body: formData,
      });

      if (!res.ok) {
        handleApiError(res);
      }
      return await res.json();
    },
    onError: (err: any) => {
      toast({
        title: "Analysis Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
