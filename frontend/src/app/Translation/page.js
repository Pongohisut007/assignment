// src/app/chat/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // เพิ่ม useRouter สำหรับ redirect
import io from "socket.io-client";

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const router = useRouter();

  // ฟังก์ชันดึง cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
  };

  useEffect(() => {
    // ดึง userId จาก cookie 'user'
    const userCookie = getCookie('user');
    let userId = null;

    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        userId = userData.userId || userData.id; // ปรับตามโครงสร้าง cookie ของคุณ
      } catch (error) {
        console.error('Failed to parse user cookie:', error);
      }
    }

    // ถ้าไม่มี userId หรือไม่ล็อกอิน ให้ redirect ไปหน้า login
    if (!userId) {
      router.push('/login');
      return;
    }

    const newSocket = io('http://localhost:9002', { transports: ['websocket'] });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server:', newSocket.id);
      newSocket.emit('joinRoom', userId);
    });

    newSocket.on('onResponse', (data) => {
      console.log('Received response:', data);
      setChatHistory((prev) => [...prev, { sender: "user", text: data.prompt }, { sender: "bot", text: data.response }]);
    });

    newSocket.on('chatHistory', (history) => {
      console.log('Received chat history:', history);
      const formattedHistory = history.flatMap(entry => [
        { sender: "user", text: entry.prompt },
        { sender: "bot", text: entry.response },
      ]);
      setChatHistory(formattedHistory);
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log('Disconnected from WebSocket server');
    };
  }, [router]); // เพิ่ม router ใน dependency array

  const handleSend = () => {
    if (socket && input.trim()) {
      const userId = JSON.parse(getCookie('user') || '{}').userId || 1; // ดึง userId จาก cookie อีกครั้ง
      socket.emit('newPrompt', { userId, prompt: input });
      setInput('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-black">
      <div className="w-1/5 bg-gray-200 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">History</h2>
        <ul className="space-y-3">
          <li className="cursor-pointer p-2 bg-gray-300 rounded-lg hover:bg-gray-400">User #1</li>
          <li className="cursor-pointer p-2 bg-gray-300 rounded-lg hover:bg-gray-400">User #2</li>
          <li className="cursor-pointer p-2 bg-gray-300 rounded-lg hover:bg-gray-400">User #3</li>
        </ul>
      </div>
      <div className="w-4/5 flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          <h1 className="text-2xl font-bold mb-4">Language Change History</h1>
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex items-center space-x-3">
          <input
            type="text"
            className="w-full p-2 border rounded-lg text-black"
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