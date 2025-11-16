import { useState } from "react";
import "../components/AIAssistant.css";
import ReactMarkdown from "react-markdown";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // helper to push messages into chat
  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };
const sendPromptToGemini = async (prompt) => {
  const shortPrompt = `
You must respond in *no more than 3 short sentences*.  
Absolutely DO NOT generate paragraphs, introductions, sections, bullet lists, or extended explanations.  
Condense your answer as tightly as possible.

USER REQUEST: ${prompt}
`;

  const resp = await fetch("https://bytebite-bq4x.onrender.com/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: shortPrompt })
  });

  const data = await resp.json();
  addMessage("assistant", data.text || data.error || "No response.");
};



    const handleQuickPrompt = (type) => {
    let prompt = "";

    if (type === "sustainable") {
      prompt = `
  Give 2–3 short sustainable dining suggestions. Keep the entire response under 4 sentences.
  `;
    }

    if (type === "relevant") {
      prompt = `
  Give the top 3 most relevant meal suggestions for this user. 
  `;
    }

    addMessage("user", prompt);
    sendPromptToGemini(prompt);
  };


 const send = async () => {
  if (!input.trim()) return;

  addMessage("user", input);

  const shortPrompt = `


USER REQUEST: ${input}
`;

  const resp = await fetch("https://bytebite-bq4x.onrender.com/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: shortPrompt })
  });

  const data = await resp.json();
  addMessage("assistant", data.text || data.error || "No response.");

  setInput("");
};


  return (
    <>
      {!open && (
        <button
          className="ai-fab"
          onClick={() => setOpen(true)}
        >
          💬 Ask AI
        </button>
      )}

      {open && (
        <div className="ai-sidebar">
          <div className="ai-sidebar-header">
            <h3>Dining AI Assistant</h3>
            <button className="ai-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-${m.role}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>


            ))}
          </div>

          <div className="ai-input-bar">

          {/* Quick action buttons row */}
          <div className="ai-quick-row">
            <button
              className="ai-quick-btn"
              onClick={() => handleQuickPrompt("sustainable")}
            >
              ♻ Sustainable
            </button>

            <button
              className="ai-quick-btn"
              onClick={() => handleQuickPrompt("relevant")}
            >
              ⭐ Most Relevant
            </button>
          </div>

          {/* Text input row */}
          <div className="ai-input-row">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about meals, nutrition, diets..."
          />


            <button className="send-btn" onClick={send}>
              Send
            </button>
          </div>

        </div>

        </div>
      )}
    </>
  );
}
