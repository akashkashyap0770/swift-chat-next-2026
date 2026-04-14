"use client";

// The input bar at the bottom of the chat
// Press Enter or click Send to send a message

import { useState } from "react";

export default function SendMessageForm({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim()); // pass message text to parent (ChatWindow)
    setText(""); // clear input field
  };

  return (
    <div className="p-4 bg-gray-900 border-t border-gray-800">
      <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-2">
        {/* Text input */}
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()} // Enter to send
          disabled={disabled}
          className="flex-1 bg-transparent text-white outline-none placeholder-gray-500 text-sm"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition font-semibold text-sm"
        >
          Send ➤
        </button>
      </div>
    </div>
  );
}
