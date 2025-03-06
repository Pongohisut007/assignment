"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useTheme } from "next-themes";
import { useAuth } from "../RootLayout.client";

const WS_URL = "https://nongao.lol-th-no1.com";
const API_URL = "https://nongao.lol-th-no1.com/api/chat";
const socket = io(WS_URL, {
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function Chat() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatHistory, setChatHistory] = useState({ sport: [], technology: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const messagesEndRef = useRef(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");

  const userListByRoom = {
    sport: ["ronaldo", "เซียนบอล"],
    technology: ["จารย์ปัญ", "เซียนโค้ด"],
  };

  useEffect(() => {
    setIsClient(true);
    if (user) {
      setUserId(user.user_id);
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch chat history");
        const chats = await response.json();
        const formattedHistory = { sport: [], technology: [] };
        chats.forEach((chat) => {
          const roomName = chat.room?.room_id === 1 ? "sport" : "technology";
          const sender = chat.owner.user_id === userId ? "user" : "bot";
          formattedHistory[roomName].push({
            sender,
            message: `${chat.owner.username} : ${chat.message}`,
            userId: chat.owner.user_id,
          });
        });
        setChatHistory(formattedHistory);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isClient && userId) fetchChatHistory();
  }, [userId, isClient]);

  useEffect(() => {
    socket.on("connect", () => console.log("Connected to WebSocket server:", socket.id));
    socket.on("disconnect", () => console.log("Disconnected from WebSocket server:", socket.id));
    socket.on("newMessageResponse", (data) => {
      setChatHistory((prev) => ({
        ...prev,
        [selectedRoom]: [
          ...prev[selectedRoom],
          {
            sender: "user",
            message: `${data?.owner?.username} : ${[4, 5, 6, 7].includes(data?.owner?.user_id) ? data?.aiResponse : data?.message}`,
            userId: data?.owner?.user_id,
          },
        ],
      }));
      setIsSending(false);
    });
    return () => {
      socket.off("newMessageResponse");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, selectedRoom]);

  const joinRoom = (room) => {
    setSelectedRoom(room);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);
    const lastWord = value.split(" ").pop();
    if (lastWord.startsWith("@") && selectedRoom) {
      const query = lastWord.slice(1).toLowerCase();
      setMentionQuery(query);
      const roomUsers = userListByRoom[selectedRoom] || [];
      const filteredSuggestions = roomUsers.filter((user) => user.toLowerCase().startsWith(query));
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    const words = inputMessage.split(" ");
    words[words.length - 1] = `@${suggestion} `;
    setInputMessage(words.join(" "));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const sendPrompt = () => {
    if (inputMessage.trim() !== "" && selectedRoom && userId) {
      setIsSending(true);
      const messageData = { owner: userId, room_name: selectedRoom, message: inputMessage };
      socket.emit("newMessage", { user_id: userId, prompt: inputMessage, data: messageData });
      setInputMessage("");
      setShowSuggestions(false);
    } else if (!selectedRoom) {
      alert("Please select a room first!");
    }
  };

  const getRoomTitle = () => {
    switch (selectedRoom) {
      case "sport": return "ห้องกีฬา";
      case "technology": return "ห้องการศึกษาเทคโนโลยี";
      default: return "กรุณาเลือกห้องแชท";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white dark:bg-gray-100 dark:text-black md:flex-row">
      {/* Left Sidebar: Room Selection */}
      <div className="w-full p-4 flex flex-col space-y-4 border-b border-gray-700 dark:border-gray-300 md:w-1/4 md:border-b-0 md:border-r">
        <div
          className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300 transition"
          onClick={() => joinRoom("sport")}
        >
          <h2 className="text-lg font-bold mb-2">ห้องกีฬา</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">คุยเรื่องกีฬาทุกประเภท</p>
        </div>
        <div
          className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300 transition"
          onClick={() => joinRoom("technology")}
        >
          <h2 className="text-lg font-bold">ห้องการศึกษาเทคโนโลยี</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">พูดคุยเกี่ยวกับเทคโนโลยีและการศึกษา</p>
        </div>
        <div className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg opacity-50">
          <h2 className="text-lg font-bold mb-2">ห้องท่องเที่ยวทั่วโลก</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">แชร์ประสบการณ์และสถานที่ท่องเที่ยวทั่วโลก</p>
        </div>
        <div className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg opacity-50">
          <h2 className="text-lg font-bold mb-2">ห้องครัวอาหาร</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">แลกเปลี่ยนสูตรอาหารและเคล็ดลับการทำครัว</p>
        </div>
        <div className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg opacity-50">
          <h2 className="text-lg font-bold mb-2">ห้องดนตรี</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">พูดคุยเกี่ยวกับเพลงและวงดนตรีที่ชื่นชอบ</p>
        </div>
        <div className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg opacity-50">
          <h2 className="text-lg font-bold mb-2">ห้องเกมมิ่ง</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">คุยเรื่องเกมและกลยุทธ์การเล่น</p>
        </div>
        <div className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg opacity-50">
          <h2 className="text-lg font-bold mb-2">ห้องภาพยนตร์</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">รีวิวและพูดคุยเกี่ยวกับหนังที่ชอบ</p>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex flex-col flex-grow p-4 md:w-3/4">
        {/* Room Title */}
        <div className="mb-4 text-center border-b border-gray-700 dark:border-gray-300 pb-2">
          <h1 className="text-cyan-400 text-xl font-bold text-white dark:text-black md:text-2xl">{getRoomTitle()}</h1>
        </div>

        {/* Chat Display Area */}
        <div className="flex-grow overflow-y-auto rounded-lg max-h-[calc(100vh-16rem)] md:max-h-[calc(100vh-12rem)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isClient && (!selectedRoom || chatHistory[selectedRoom]?.length === 0) && !isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
              {selectedRoom ? "No messages yet. Start chatting!" : "Please select a room to start chatting!"}
            </div>
          )}
          {isClient &&
            selectedRoom &&
            chatHistory[selectedRoom]?.map((msg, index) => {
              const [displayUsername, messageContent] = msg.message.split(" : ", 2);
              const isCurrentUser = msg.userId === userId;
              return (
                <div
                  key={index}
                  className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"} px-2`}
                >
                  <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start space-x-2 max-w-[85%] md:max-w-[70%]`}>
                    <div className={isCurrentUser ? "text-right" : "text-left"}>
                      <div className="text-white-400 font-bold text-sm">{displayUsername}</div>
                      <div
                        className={`${isCurrentUser ? "bg-blue-600" : "bg-gray-700"} text-white p-3 rounded-lg mt-1 inline-block break-all`}
                      >
                        {messageContent}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box with Suggestions */}
        <div className="relative mt-4 shrink-0">
          <div className="flex space-x-2 bg-[#313335] p-3 rounded-3xl w-full md:p-4">
            <input
              type="text"
              className="flex-grow bg-[#313335] outline-none text-white text-sm md:text-base"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendPrompt();
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              disabled={isSending || !selectedRoom}
            />
            <button
              onClick={sendPrompt}
              disabled={isSending || !selectedRoom}
              className={`bg-[#5E6668] text-white px-3 py-2 rounded-3xl hover:scale-105 hover:shadow-md transition duration-200 md:px-4 ${
                isSending || !selectedRoom ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>

          {/* Suggestion Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-14 left-0 w-full bg-gray-800 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  @{suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}