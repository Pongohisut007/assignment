"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useTheme } from "next-themes";
import { useAuth } from "../RootLayout.client";

const WS_URL = "http://localhost:9002"; // WebSocket URL
const API_URL = "https://nongao.lol-th-no1.com/api/chat"; // REST API URL
// const socket = io(WS_URL, { transports: ["websocket"] }); // เชื่อมต่อ WebSocket
const socket = io("https://nongao.lol-th-no1.com", {
  path: "/socket.io/",
  transports: ["websocket", "polling"], // ระบุชัดเจน
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function Chat() {
  const { user } = useAuth();

  const [userId, setUserId] = useState(null); // เปลี่ยนชื่อเป็น camelCase
  const [selectedRoom, setSelectedRoom] = useState(null); // Selected room
  const [chatHistory, setChatHistory] = useState({ sport: [], technology: [] }); // Chat history per room
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [inputMessage, setInputMessage] = useState(""); // Input message
  const [isSending, setIsSending] = useState(false); // Sending state
  const [username, setUsername] = useState("Guest"); // ค่าเริ่มต้นสำหรับ SSR
  const [isClient, setIsClient] = useState(false); // Client-side flag
  const { theme } = useTheme(); // Theme from next-themes
  const messagesEndRef = useRef(null); // Ref for scrolling to latest message

  // State for Suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");

  // Mock list of users separated by room
  const userListByRoom = {
    sport: ["ronaldo", "เซียนบอล"],
    technology: ["จารย์ปัญ", "เซียนโค้ด"],
  };

  // อัปเดต username และ userId เมื่อโหลดฝั่ง client
  useEffect(() => {
    setIsClient(true);

    // ตั้งค่า username จาก sessionStorage หรือ random ถ้ายังไม่มี
    

    // ตั้งค่า userId จาก useAuth
    if (user) {
      console.log(user)
      setUserId(user.user_id);
      setUsername(user.username)
    }
  }, [user]);

  // ดึงประวัติแชทเมื่อ userId มีค่า
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!userId) return; // รอจนกว่า userId จะมีค่า

      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch chat history");
        const chats = await response.json();
        console.log("chat: ", chats);

        // แยกประวัติแชทตามห้อง (sport: room_id=1, technology: room_id=2)
        const formattedHistory = { sport: [], technology: [] };
        chats.forEach((chat) => {
          const roomName = chat.room?.room_id === 1 ? "sport" : "technology";
          const sender = chat.owner.user_id === userId ? "user" : "bot";
          console.log("tsfdgdgdf = ",chat.owner.username)
          formattedHistory[roomName].push({
            sender,
            message: `${sender === "" ? `${chat.owner.username}` : ` ${chat.owner.username}`} : ${chat.message}`,
            profilePic:"",
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

    if (isClient && userId) {
      fetchChatHistory();
    }
  }, [userId, isClient]);

  // WebSocket event listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server:", socket.id);
    });
    socket.on("newMessageResponse", (data) => {
      console.log("Received new message:", data);

      if ([4,5,6,7].includes(data?.owner?.user_id)) {
        setChatHistory((prev) => {
          const room = selectedRoom;
          return {
            ...prev,
            [room]: [
              ...prev[room],
              {
                sender: "user",
                message: `${data.owner.username} : ${data?.aiResponse}`,
                userId: data?.owner?.user_id,
              },
            ],
          };
        });
      }
      else {

      }
      setIsSending(false);
    });

    return () => {
      socket.off("newMessageResponse");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [selectedRoom, username, userId, inputMessage]);

  // Scroll to the latest message when chat history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, selectedRoom]);

  // Join a room
  const joinRoom = (room) => {
    setSelectedRoom(room);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle input change and detect @ with room-specific suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    const lastWord = value.split(" ").pop();
    if (lastWord.startsWith("@") && selectedRoom) {
      const query = lastWord.slice(1).toLowerCase();
      setMentionQuery(query);
      const roomUsers = userListByRoom[selectedRoom] || [];
      const filteredSuggestions = roomUsers.filter((user) =>
        user.toLowerCase().startsWith(query)
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    const words = inputMessage.split(" ");
    words[words.length - 1] = `@${suggestion} `;
    setInputMessage(words.join(" "));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Send a prompt to the backend via WebSocket
  const sendPrompt = () => {
    if (inputMessage.trim() !== "" && selectedRoom && userId) {
      setIsSending(true);
      const messageData = {
        owner: userId,
        room_name: selectedRoom,
        message: inputMessage,
      };
      socket.emit("newMessage", {
        user_id: userId,
        prompt: inputMessage,
        data: messageData,
      });

      // เพิ่มข้อความของผู้ใช้เข้าไปใน chatHistory ทันที
      setChatHistory((prev) => ({
        ...prev,
        [selectedRoom]: [
          ...prev[selectedRoom],
          {
            sender: "user",
            message: `${username} : ${inputMessage}`,
            profilePic: '',
            userId: userId,
          },
        ],
      }));
      
      setInputMessage("");
      setShowSuggestions(false);
    } else if (!selectedRoom) {
      alert("Please select a room first!");
    }
  };

  // Get room title based on selected room
  const getRoomTitle = () => {
    switch (selectedRoom) {
      case "sport":
        return "ห้องกีฬา";
      case "technology":
        return "ห้องการศึกษาเทคโนโลยี";
      default:
        return "กรุณาเลือกห้องแชท";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white dark:bg-gray-100 dark:text-black">
      {/* Left Sidebar: Room Selection */}
      <div className="w-1/4 p-4 flex flex-col space-y-4 border-r border-gray-700 dark:border-gray-300">
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
      </div>

      {/* Right Chat Area */}
      <div className="w-3/4 flex flex-col flex-grow p-4 sm:p-12 overflow-hidden">
        {/* Room Title */}
        <div className="mb-4 text-center border-b border-gray-700 dark:border-gray-300 pb-2">
          <h1 className="text-2xl font-bold text-white dark:text-black mb-3">{getRoomTitle()}</h1>
        </div>

        {/* Chat Display Area */}
        <div className="p-4 flex-grow overflow-y-auto rounded-lg w-full max-w-[50rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:p-4 sm:h-80 sm:mb-4 sm:max-w-[50rem] mx-auto">
          {isClient && (!selectedRoom || chatHistory[selectedRoom]?.length === 0) && !isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400">
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
                  className={`mb-4 break-words flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}>
                    <div className={isCurrentUser ? "text-right" : "text-left"}>
                      <div className="text-white-400 font-bold text-sm">{displayUsername}</div>
                      <div
                        className={`${isCurrentUser ? "bg-blue-600" : "bg-gray-700"} text-white p-3 rounded-lg mt-1 inline-block break-all max-w-full sm:max-w-full`}
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
        <div className="relative flex space-x-2 bg-[#313335] p-4 rounded-3xl w-full max-w-[50rem] mx-auto sm:p-6 sm:rounded-3xl shrink-0">
          <input
            type="text"
            className="flex-grow bg-[#313335] outline-none text-white text-sm sm:text-base"
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
            className={`bg-[#5E6668] text-white px-4 py-2 rounded-3xl hover:scale-105 hover:shadow-md transition duration-200 ${
              isSending || !selectedRoom ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSending ? "Sending..." : "Send"}
          </button>

          {/* Suggestion Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-14 left-0 w-full max-w-[50rem] bg-gray-800 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-700 cursor-pointer text-white"
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