import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownMessage from "@/components/shared/MarkdownMessage";

export default function ChatBar() {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const sessionId = useRef(`workbench-${Date.now()}`);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    const userMsg = message.trim();
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsOpen(true);
    setLoading(true);

    try {
      const res = await api.sendChat(sessionId.current, userMsg);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request. Please try again." }]);
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

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  return (
    <div data-testid="chat-bar" className="fixed bottom-0 left-[72px] right-0 z-30">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-6 mb-2 bg-white rounded-xl border border-gray-200 shadow-lg max-h-64 overflow-y-auto p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">AI Assistant</span>
              <button data-testid="close-chat-panel" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-[#1a3a2a] text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}>
                    {msg.role === "user" ? msg.content : <MarkdownMessage content={msg.content} />}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center gap-3 max-w-4xl">
          <Sparkles size={18} className="text-[#55C9A6] shrink-0" />
          <input
            ref={inputRef}
            data-testid="chat-bar-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => messages.length > 0 && setIsOpen(true)}
            placeholder="Start typing to ask underwriting AI agent questions"
            className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
          />
          {message.trim() && (
            <button data-testid="chat-bar-send" onClick={handleSend} className="text-[#55C9A6] hover:text-[#34D399] transition-colors">
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
