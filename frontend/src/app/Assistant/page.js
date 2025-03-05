"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useTheme } from "next-themes";

const head = "http://localhost:3000"; // URL ของ backend

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState(""); // เพิ่ม state สำหรับ input
  const [isSending, setIsSending] = useState(false); // เพิ่ม state สำหรับสถานะการส่ง
  const { theme } = useTheme();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userId = 1; // สมมติ userId (ปรับให้ dynamic ได้)
    const storedUsername = "User1"; // สมมติ username
    sessionStorage.setItem("chatUsername", storedUsername);

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
        { sender: "user", message: `${storedUsername} : ${data.prompt}` },
        { sender: "bot", message: `Bot : ${data.response}` },
      ]);
      setIsLoading(false);
    });

    newSocket.on("chatHistory", (history) => {
      console.log("Received chat history:", history);
      const formattedHistory = history.flatMap((entry) => [
        { sender: "user", message: `${storedUsername} : ${entry.prompt}` },
        { sender: "bot", message: `Bot : ${entry.response}` },
      ]);
      setChatHistory(formattedHistory);
      setIsLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ฟังก์ชันส่ง prompt
  const sendPrompt = async () => {
    if (inputMessage.trim() !== "") {
      setIsSending(true);
      try {
        const response = await fetch(`${head}/openai/process-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "1", // สมมติ userId (ปรับให้ dynamic ได้)
            prompt: inputMessage,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setInputMessage(""); // ล้าง input หลังส่งสำเร็จ
      } catch (error) {
        console.error("Error sending prompt:", error);
        alert("Failed to send prompt!");
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="flex flex-col flex-grow p-4 sm:p-12 overflow-hidden min-h-screen bg-gray-900 text-white dark:bg-gray-100 dark:text-black">
      {/* Chat Display Area */}
      <div className="p-4 flex-grow overflow-y-auto rounded-lg w-full max-w-[50rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:p-4 sm:h-80 sm:mb-4 sm:max-w-[50rem] mx-auto">
        {isLoading && (
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 dark:border-blue-600"></div>
            <span className="text-gray-400 dark:text-gray-600">Grok is thinking...</span>
          </div>
        )}
        {chatHistory.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-400">No messages yet. Start chatting!</div>
        )}
        {chatHistory.map((msg, index) => {
          const [displayUsername, messageContent] = msg.message.split(" : ", 2);
          const storedUsername = sessionStorage.getItem("chatUsername");
          const isCurrentUser = displayUsername === storedUsername;

          return (
            <div
              key={index}
              className={`mb-4 break-words ${
                isCurrentUser ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <div className={isCurrentUser ? "text-right" : "text-left"}>
                <div className="text-white-400 font-bold text-sm">
                  {displayUsername}
                </div>
                <div
                  className={`${
                    isCurrentUser ? "bg-blue-600" : "bg-gray-700"
                  } text-white p-3 rounded-lg mt-1 inline-block break-all max-w-full sm:max-w-full`}
                >
                  {messageContent}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box for Sending Prompt */}
      <div className="flex space-x-2 bg-[#313335] p-4 rounded-3xl w-full max-w-[50rem] mx-auto sm:p-6 sm:rounded-3xl shrink-0">
        <input
          type="text"
          className="flex-grow bg-[#313335] outline-none text-white text-sm sm:text-base"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendPrompt()} // ส่งด้วย Enter
          disabled={isSending}
        />
        <button
          onClick={sendPrompt}
          disabled={isSending}
          className={`bg-[#5E6668] text-white px-4 py-2 rounded-3xl hover:scale-105 hover:shadow-md transition duration-200 ${
            isSending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}