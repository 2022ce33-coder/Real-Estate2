import React, { useEffect, useRef, useState } from "react";
import { sendToGemini } from "@/integrations/gemini/client";

type Msg = { id: string; role: "user" | "assistant"; text: string };

const GeminiChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem("gemini_chat_messages");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("gemini_chat_messages", JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: Msg["role"], text: string) => {
    setMessages((m) => [...m, { id: Date.now().toString() + Math.random(), role, text }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    addMessage("user", userText);
    setInput("");
    setLoading(true);

    try {
      const response = await sendToGemini(userText);
      const answer = response?.text ?? "Sorry, something went wrong.";
      addMessage("assistant", answer);
    } catch (err) {
      addMessage("assistant", "Sorry, I couldn't help with that. Please try again.");
      console.error("Gemini error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput("");
    addMessage("user", question);
    setLoading(true);
    
    sendToGemini(question).then(response => {
      const answer = response?.text ?? "Sorry, something went wrong.";
      addMessage("assistant", answer);
    }).catch(err => {
      addMessage("assistant", "Sorry, I couldn't help with that. Please try again.");
      console.error("Gemini error:", err);
    }).finally(() => {
      setLoading(false);
    });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {open && (
          <div className="mb-3 w-[360px] max-w-[92vw] h-[520px] bg-white/90 dark:bg-slate-900/95 backdrop-blur rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">G</div>
                <div>
                  <div className="text-sm font-semibold">Gemini Real Estate AI</div>
                  <div className="text-xs text-slate-500">Real data • Verified agents • Live database</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    localStorage.removeItem("gemini_chat_messages");
                    setMessages([]);
                  }}
                >
                  Clear
                </button>
                <button className="ml-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-sm" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 p-4 overflow-auto space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-semibold mb-3">💬 Hi! I'm your Real Estate Assistant</p>
                    <p className="text-xs leading-relaxed">Tell me what you're looking for and I'll help you find the perfect property or connect you with agents.</p>
                  </div>
                  
                  {/* Quick question suggestions */}
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-medium text-slate-500">Quick questions:</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleQuickQuestion("I'm looking for a 2-bedroom apartment in Lahore")}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                      >
                        "Looking for 2-bed apartment in Lahore"
                      </button>
                      <button
                        onClick={() => handleQuickQuestion("Show me agents in DHA Karachi")}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition"
                      >
                        "Find agents in DHA Karachi"
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span>Searching...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-200/70 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search properties, find agents, ask about areas..."
                  className="flex-1 rounded-xl border border-slate-200/80 dark:border-slate-700 px-3 py-2 bg-white/70 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white shadow hover:opacity-95 disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating CTA */}
        <button
          aria-label="Open Gemini chat"
          onClick={() => setOpen((s) => !s)}
          className="group relative inline-flex items-center justify-center w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white text-2xl hover:scale-105 transition-transform"
        >
          <span className="sr-only">Open chat</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="pointer-events-none">
            <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8a9.04 9.04 0 01-2.5-.36L6 20l.7-2.2A7.9 7.9 0 014.5 11C4.5 6.582 8.53 3 12 3z" fill="white" />
          </svg>
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-medium">+</div>
        </button>
      </div>
    </div>
  );
};

export default GeminiChatbot;
