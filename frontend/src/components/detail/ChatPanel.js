import { useState, useRef, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { api } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import MarkdownMessage from "@/components/shared/MarkdownMessage";

export default function ChatPanel({ application }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const sessionRef = useRef(`detail-${application?.id}-${Date.now()}`);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history
  useEffect(() => {
    if (!application?.id) return;
    sessionRef.current = `detail-${application.id}-${Date.now()}`;
  }, [application?.id]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await api.sendChat(sessionRef.current, text, application?.id);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div data-testid="chat-panel" className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Application Summary Card */}
      {application?.application_summary && (
        <div className="p-4">
          <div className="bg-[#1a3a2a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-[#55C9A6]" />
              <span className="text-xs font-semibold text-[#55C9A6]">Application Summary</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{application.application_summary}</p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#1a3a2a] text-white rounded-2xl rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none"
                }`}
              >
                {msg.role === "user" ? msg.content : <MarkdownMessage content={msg.content} />}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
          <input
            data-testid="detail-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the underwriter AI agent"
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
          <button
            data-testid="detail-chat-send"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-1.5 bg-[#1a3a2a] text-white rounded-lg hover:bg-[#2a4a3a] transition-colors disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
