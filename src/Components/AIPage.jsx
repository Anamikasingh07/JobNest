import { useState } from "react";
import "./AIPage.css";

const AIAssistant = () => {

  const [message, setMessage] = useState("");

  const [chat, setChat] = useState([
    {
      sender: "ai",
      text: "Hi! I can help you prepare for jobs."
    }
  ]);

  const handleSend = () => {

    if (message.trim() === "") return;

    // add user message
    const newChat = [
      ...chat,
      {
        sender: "user",
        text: message
      },

      {
        sender: "ai",
        text: "Focus on React, JavaScript and projects."
      }
    ];

    setChat(newChat);

    setMessage("");
  };

  return (

    <div className="ai-page">

      <div className="ai-header">
        <h2>🤖 AI Career Assistant</h2>
      </div>

      {/* ACTION BUTTONS */}
      <div className="ai-actions">

        <button>📝 Resume Review</button>

        <button>✍ Cover Letter</button>

        <button>🎤 Interview Prep</button>

      </div>

      {/* CHAT BOX */}
      <div className="chat-box">

        {chat.map((msg, index) => (

          <div
            key={index}
            className={
              msg.sender === "user"
                ? "user-message"
                : "ai-message"
            }
          >
            {msg.text}
          </div>

        ))}

      </div>

      {/* INPUT */}
      <div className="chat-input">

        <input
          type="text"
          placeholder="Ask something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={handleSend}>
          Send
        </button>

      </div>

    </div>
  );
};

export default AIAssistant;