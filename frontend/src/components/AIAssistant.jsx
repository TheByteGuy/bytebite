import { useState } from "react";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const send = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    // --- replace with your AI API ---
    const resp = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });

    const data = await resp.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);

    setInput("");
  };

  return (
    <>
      {/* 🌟 Floating activation button */}
      {!open && (
        <button
          className="ai-fab"
          onClick={() => setOpen(true)}
        >
          💬 Ask AI
        </button>
      )}

      {/* 🌟 Sidebar itself */}
      {open && (
        <div className="ai-sidebar">
          <div className="ai-sidebar-header">
            <h3>Dining AI Assistant</h3>
            <button className="ai-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-${m.role}`}>
                {m.content}
              </div>
            ))}
          </div>

          <div className="ai-input">
            <input
              value={input}
              placeholder="Ask about meals, nutrition, diets..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={send}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
