import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

function handleApiError(res: Response) {
  if (res.status === 401) throw new Error("Invalid or expired API token. Please re-enter your token.");
  if (res.status === 403) throw new Error("Billing quota exceeded. Please check your plan.");
  if (res.status === 503) throw new Error("Service temporarily unavailable. Try again later.");
  throw new Error(`Request failed (${res.status})`);
}

export function useConversations() {
  const { authHeaders } = useAuth();
  
  // Note: API doesn't have a 'list conversations' endpoint in schema provided, 
  // but usually a chat app would. Assuming we might persist conversation ID locally 
  // or just create new ones. For this scope, we focus on creating and messaging.
  return {};
}

export function useCreateConversation() {
  const { authHeaders } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.chatterblast.createConversation.path, {
        method: api.chatterblast.createConversation.method,
        headers: { ...authHeaders() },
      });
      
      if (!res.ok) {
        handleApiError(res);
      }
      return await res.json();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useMessages(conversationId: number | null) {
  const { authHeaders } = useAuth();

  return useQuery({
    queryKey: [api.chatterblast.getMessages.path, conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const url = buildUrl(api.chatterblast.getMessages.path, { id: conversationId });
      const res = await fetch(url, {
        headers: { ...authHeaders() },
      });

      if (!res.ok) {
        if (res.status === 404) return [];
        handleApiError(res);
      }
      return await res.json();
    },
    enabled: !!conversationId,
    refetchInterval: 1000, // Poll every second
  });
}

export function useSendMessage() {
  const { authHeaders } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const res = await fetch(api.chatterblast.sendMessage.path, {
        method: api.chatterblast.sendMessage.method,
        headers: { 
          "Content-Type": "application/json",
          ...authHeaders() 
        },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!res.ok) {
        handleApiError(res);
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.chatterblast.getMessages.path, variables.conversationId] 
      });
    },
    onError: (err: any) => {
      toast({
        title: "Message Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
