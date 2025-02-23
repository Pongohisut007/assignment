"use client";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "user", text: "Hello, how are you?" },
    { sender: "bot", text: "I am good, thank you! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: "user", text: input }]);
      setInput("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "This is a bot response." },
        ]);
      }, 500);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar (20%) */}
      <div className="w-1/5 bg-gray-200 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">History</h2>
        <ul className="space-y-3">
          <li className="cursor-pointer p-2 bg-gray-300 rounded-lg hover:bg-gray-400">
            User #1
          </li>
          <li className="cursor-pointer p-2 bg-gray-300 rounded-lg hover:bg-gray-400">
            User #2
          </li>
          <li className="cursor-pointer p-2 bg-gray-300 rounded-lg hover:bg-gray-400">
            User #3
          </li>
        </ul>
      </div>

      {/* Main Content (80%) */}
      <div className="w-4/5 flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          <h1 className="text-2xl font-bold mb-4">Language Change History</h1>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Section */}
        <div className="border-t p-3 flex items-center space-x-3">
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
