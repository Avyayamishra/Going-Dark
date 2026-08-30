"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Move, Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/hooks/use-audio";
import { cn } from "@/lib/utils";
import { getSqlTutorResponse } from "@/lib/sql/tutor-knowledge";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

export function SqlTutorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "bot",
      text: "SQL Tutor online. I can teach you SQL concepts — SELECT, WHERE, JOIN, GROUP BY, HAVING, subqueries, CTEs, and more. I will NOT reveal any case-specific information, suspects, or answers. What would you like to learn?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: -1, y: -1 }); // -1 = default bottom-right
  const dragOffset = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { play } = useAudio();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (position.x === -1) {
      // First drag from default position — calculate current position
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
    }
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      // Clamp to viewport
      const clampedX = Math.max(0, Math.min(window.innerWidth - 60, newX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - 60, newY));
      setPosition({ x: clampedX, y: clampedY });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    play("click");
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Generate response (deterministic, no AI API needed)
    setTimeout(() => {
      const response = getSqlTutorResponse(text);
      const botMsg: Message = { id: `b-${Date.now()}`, role: "bot", text: response };
      setMessages((prev) => [...prev, botMsg]);
    }, 300);
  }, [input, play]);

  // Floating button (when closed) or chat panel (when open)
  if (!isOpen) {
    return (
      <button
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (!isDragging) {
            play("click");
            setIsOpen(true);
          }
        }}
        className={cn(
          "fixed z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform",
          isDragging && "cursor-grabbing",
        )}
        style={
          position.x === -1
            ? { bottom: 24, right: 24 }
            : { left: position.x, top: position.y }
        }
        aria-label="Open SQL Tutor"
        title="SQL Tutor — drag to move"
      >
        <MessageSquare className="size-6" />
        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-white" />
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 w-[340px] max-w-[92vw] bg-card border border-primary/30 rounded-sm shadow-2xl flex flex-col overflow-hidden",
        isDragging && "cursor-grabbing",
      )}
      style={
        position.x === -1
          ? { bottom: 24, right: 24, height: 480, maxHeight: "70vh" }
          : { left: position.x, top: position.y, height: 480, maxHeight: "70vh" }
      }
    >
      {/* Header (draggable) */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/80 backdrop-blur-sm cursor-grab select-none"
      >
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-wider text-primary">SQL Tutor</span>
          <Move className="size-3 text-muted-foreground/40" />
        </div>
        <button
          onClick={() => {
            play("click");
            setIsOpen(false);
          }}
          className="size-6 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
          aria-label="Close chatbot"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cn(
                "size-6 rounded-sm border flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "user"
                  ? "border-border/60 bg-card/60"
                  : "border-primary/30 bg-primary/10",
              )}
            >
              {msg.role === "user" ? (
                <User className="size-3 text-muted-foreground" />
              ) : (
                <Bot className="size-3 text-primary" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-sm px-2.5 py-1.5 text-[12px] leading-relaxed",
                msg.role === "user"
                  ? "bg-primary/10 text-foreground border border-primary/20"
                  : "bg-black/20 text-foreground/90 border border-border/40",
              )}
            >
              <pre className="whitespace-pre-wrap font-mono text-[11px]">{msg.text}</pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="px-3 py-1.5 border-t border-border/40 flex flex-wrap gap-1">
          {["SELECT", "WHERE", "JOIN", "GROUP BY", "HAVING", "subquery", "CTE"].map((topic) => (
            <button
              key={topic}
              onClick={() => {
                play("click");
                setInput(`Teach me about ${topic}`);
                setTimeout(() => {
                  const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: `Teach me about ${topic}` };
                  setMessages((prev) => [...prev, userMsg]);
                  setInput("");
                  setTimeout(() => {
                    const response = getSqlTutorResponse(`Teach me about ${topic}`);
                    setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: "bot", text: response }]);
                  }, 300);
                }, 0);
              }}
              className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border border-border/40 rounded-sm text-muted-foreground hover:text-primary hover:border-primary/30 cursor-pointer transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-2 border-t border-border/60 flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask about SQL..."
          className="flex-1 bg-black/30 border border-border/40 rounded-sm px-2 py-1.5 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 cursor-text"
        />
        <Button
          onClick={sendMessage}
          size="icon"
          className="size-7 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Send className="size-3" />
        </Button>
      </div>
    </div>
  );
}
