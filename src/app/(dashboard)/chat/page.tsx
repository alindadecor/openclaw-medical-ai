"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Loader2,
  FileText,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import type { Citation } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  confidence?: number;
  sourcesSearched?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState<Citation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = (await res.json()) as {
        success: boolean;
        data?: {
          response: string;
          citations: Citation[];
          confidence: number;
          sourcesSearched: number;
        };
        error?: string;
      };

      if (data.success && data.data) {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.data.response,
          citations: data.data.citations,
          confidence: data.data.confidence,
          sourcesSearched: data.data.sourcesSearched,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (data.data.citations?.length > 0) {
          setSelectedCitations(data.data.citations);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${data.error}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Network error. Please try again.",
        },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                OpenClaw Medical AI
              </h2>
              <p className="text-gray-500 mb-8">
                Ask any medical or research question. Every answer is backed by
                evidence from PubMed and peer-reviewed sources.
              </p>
              <div className="flex items-center gap-2 justify-center text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                For research purposes only. Not a substitute for medical advice.
              </div>
              <div className="grid grid-cols-1 gap-2 mt-6">
                {[
                  "What are the latest treatments for type 2 diabetes?",
                  "Explain the mechanism of mRNA vaccines",
                  "What is the current status of CRISPR gene therapy clinical trials?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-left text-sm px-4 py-3 rounded-lg border border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && msg.confidence != null && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <Badge
                          variant="outline"
                          className={
                            msg.confidence >= 70
                              ? "border-emerald-300 text-emerald-700"
                              : msg.confidence >= 40
                                ? "border-amber-300 text-amber-700"
                                : "border-red-300 text-red-700"
                          }
                        >
                          Confidence: {msg.confidence}%
                        </Badge>
                        {msg.sourcesSearched != null && (
                          <span className="text-xs text-gray-400">
                            {msg.sourcesSearched} sources searched
                          </span>
                        )}
                        {msg.citations && msg.citations.length > 0 && (
                          <button
                            onClick={() =>
                              setSelectedCitations(msg.citations || [])
                            }
                            className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            {msg.citations.length} citations
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching sources & generating response...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask a medical or research question..."
              className="resize-none min-h-[44px] max-h-32"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Citation panel */}
      <div className="hidden lg:block w-80 border-l border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Sources & Citations
          </h3>
        </div>
        {selectedCitations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            Citations will appear here when the AI references sources.
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {selectedCitations.map((c, i) => (
              <Card key={c.id} className="border-gray-100 shadow-none">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs font-medium text-gray-900 leading-tight">
                    [{i + 1}] {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-xs text-gray-500 mb-1">
                    {c.authors.slice(0, 3).join(", ")}
                    {c.authors.length > 3 && " et al."}
                  </p>
                  <p className="text-xs text-gray-400">
                    {c.journal} ({c.year})
                  </p>
                  {c.snippet && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-xs text-gray-500 line-clamp-3">
                        {c.snippet}
                      </p>
                    </>
                  )}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-2"
                  >
                    PubMed <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
