import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, RefreshCw, Zap } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Salut coach ! Comment va mon plan ?",
  "Je voudrais remplacer ma séance de mardi par du fractionné",
  "J'ai une douleur au genou, que faire ?",
  "Est-ce que je suis prêt pour mon 10km ?",
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: history = [], isLoading: loadingHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
  });

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const allMessages = [...history, ...localMessages];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", { message });
      return res.json();
    },
    onMutate: (message) => {
      setLocalMessages(prev => [...prev, { role: "user", content: message }]);
      setInput("");
    },
    onSuccess: (data) => {
      setLocalMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      if (data.planUpdated) {
        queryClient.invalidateQueries({ queryKey: ["/api/plan"] });
      }
      // Refresh history from server
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
    onError: () => {
      setLocalMessages(prev => [
        ...prev,
        { role: "assistant", content: "Erreur de connexion. Réessaie dans un instant." },
      ]);
    },
    onSettled: () => {
      // Once server history refreshes, clear local messages to avoid duplicates
      setTimeout(() => setLocalMessages([]), 500);
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto" data-testid="page-chat">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Coach IA</h2>
            <p className="text-xs text-muted-foreground">
              Discute avec ton coach pour adapter ton plan d'entraînement
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {loadingHistory ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <Zap className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Bienvenue Hugo !</p>
              <p className="text-xs text-muted-foreground max-w-md">
                Je suis ton coach running IA. Tu peux me demander de modifier ton plan,
                analyser tes performances, ou poser des questions sur ton entraînement.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s);
                    textareaRef.current?.focus();
                  }}
                  className="text-left p-3 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-accent/50 transition-colors text-xs text-muted-foreground leading-relaxed"
                  data-testid={`button-suggestion-${i}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          allMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`message-${msg.role}-${i}`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-start shrink-0">
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-accent/60 text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex items-start shrink-0">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {sendMutation.isPending && (
          <div className="flex gap-3 justify-start" data-testid="message-loading">
            <div className="flex items-start shrink-0">
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="bg-accent/60 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Le coach réfléchit...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-card/50 backdrop-blur-sm p-4">
        {allMessages.length > 0 && allMessages[allMessages.length - 1]?.role === "assistant" && (
          <div className="flex items-center gap-1.5 mb-2">
            {allMessages[allMessages.length - 1]?.content.includes("plan") && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <RefreshCw className="w-2.5 h-2.5" />
                Plan mis à jour
              </Badge>
            )}
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Demande une modification du plan, un conseil..."
            className="min-h-[44px] max-h-[120px] resize-none text-sm"
            rows={1}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="shrink-0 h-[44px] w-[44px]"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Le coach peut modifier ton plan directement dans la conversation
        </p>
      </div>
    </div>
  );
}
