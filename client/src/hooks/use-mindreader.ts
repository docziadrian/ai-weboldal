import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";

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
        const error = await res.json();
        throw new Error(error.message || "Analysis failed");
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
