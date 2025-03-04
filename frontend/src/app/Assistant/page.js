"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useTheme } from "next-themes"; // ต้องมี

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme(); // ใช้เพื่อ debug (ไม่จำเป็นต้องใช้ใน UI)

  useEffect(() => {
    const userId = 1;
    const newSocket = io("http://localhost:9002", { transports: ["websocket"] });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server:", newSocket.id);
      newSocket.emit("joinRoom", userId);
    });

    newSocket.on("processing", () => {
      console.log("AI is processing...");
      setIsLoading(true);
    });

    newSocket.on("onLog", (data) => {
      console.log("Received log:", data);
      setChatHistory((prev) => [
        ...prev,
        { sender: "user", text: data.prompt },
        { sender: "bot", text: data.response },
      ]);
      setIsLoading(false);
    });

    newSocket.on("chatHistory", (history) => {
      console.log("Received chat history:", history);
      const formattedHistory = history.flatMap((entry) => [
        { sender: "user", text: entry.prompt },
        { sender: "bot", text: entry.response },
      ]);
      setChatHistory(formattedHistory);
      setIsLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans dark:bg-gray-100 dark:text-black">
      <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
        {isLoading && (
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 dark:border-blue-600"></div>
            <span className="text-gray-400 dark:text-gray-600">Grok is thinking...</span>
          </div>
        )}
        {chatHistory.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-400">No messages yet. Speak to start chatting.</div>
        )}
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-gray-800 text-gray-200 dark:bg-gray-300 dark:text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}