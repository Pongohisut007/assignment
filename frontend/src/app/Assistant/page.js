"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useTheme } from "next-themes";

const head = "https://nongao.lol-th-no1.com/api"; // Backend URL
const socket = io(head); // Initialize socket outside the component

// Utility function to get or set username, avoiding SSR mismatch
const getOrSetUsername = () => {
  if (typeof window === "undefined") return "Guest"; // Default for SSR
  const storedUsername = sessionStorage.getItem("chatUsername");
  if (storedUsername) return storedUsername;
  const newUsername = `User-${Math.floor(Math.random() * 10000)}`;
  sessionStorage.setItem("chatUsername", newUsername);
  return newUsername;
};

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState(null); // Selected room
  const [chatHistory, setChatHistory] = useState({ sports: [], tech: [] }); // Chat history per room
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [inputMessage, setInputMessage] = useState(""); // Input message
  const [isSending, setIsSending] = useState(false); // Sending state
  const [username, setUsername] = useState(getOrSetUsername()); // Username
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Profile modal state
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for profile
  const [isClient, setIsClient] = useState(false); // Client-side flag
  const { theme } = useTheme(); // Theme from next-themes
  const messagesEndRef = useRef(null); // Ref for scrolling to latest message

  // State for Suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");

  // Mock list of users separated by room (replace with backend data if available)
  const userListByRoom = {
    sports: [
      "ronaldo",
      "เซียนบอล",
    ],
    tech: [
      "จารย์ปัญ",
      "เซียนโค้ด",
    ],
  };

  // Effect for client-side initialization
  useEffect(() => {
    setIsClient(true); // Mark as client-side after mount

    // Mock chat history
    const mockChatHistory = {
      sports: [
        { sender: "user", message: "ไอตูน : ทีมไหนชนะเมื่อวาน?", profilePic: "https://via.placeholder.com/40?text=U1", userId: "1234" },
        { sender: "bot", message: "Ronaldo : ผมไม่มีข้อมูลล่าสุด แต่คิดว่า Man Utd น่าจะชนะนะ! Suiiiiiiiiiiii", profilePic: "https://via.placeholder.com/40?text=R", userId: "999" },
        { sender: "user", message: "วิลดุล : Ronaldo or Messi ?", profilePic: "https://via.placeholder.com/40?text=U2", userId: "5678" },
        { sender: "bot", message: "Messi : ต้องเป็นฉันสิ วิลดุล ", profilePic: "https://via.placeholder.com/40?text=B", userId: "000" },
      ],
      tech: [
        { sender: "user", message: "กรมพระยาเน : AI ช่วยการศึกษาได้ยังไง?", profilePic: "https://via.placeholder.com/40?text=U3", userId: "9876" },
        { sender: "bot", message: "พี่หมีชอบ nan : AI ช่วยปรับการเรียนให้เหมาะกับแต่ละคนได้ เช่น แนะนำคอร์ส!", profilePic: "https://via.placeholder.com/40?text=B", userId: "000" },
        { sender: "user", message: "ลิล บอลลูน : แล้วเทคโนโลยี blockchain ล่ะ?", profilePic: "https://via.placeholder.com/40?text=U4", userId: "4321" },
        { sender: "bot", message: "พี่เขียมเอง : Blockchain ช่วยเรื่องความปลอดภัยข้อมูล เช่น ใบรับรอง!", profilePic: "https://via.placeholder.com/40?text=B", userId: "000" },
      ],
    };
    setChatHistory(mockChatHistory);

    // WebSocket event listeners
    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    socket.on("onLog", (data) => {
      console.log("Received log:", data);
      const room = data.room;
      setChatHistory((prev) => ({
        ...prev,
        [room]: [
          ...prev[room],
          { sender: "user", message: `${data.username} : ${data.prompt}`, profilePic: data.profilePic || "https://via.placeholder.com/40?text=U", userId: data.userId || "1" },
          { sender: "bot", message: `Bot : ${data.response}`, profilePic: "https://via.placeholder.com/40?text=B", userId: "000" },
        ],
      }));
      setIsLoading(false);
    });

    socket.on("chatHistory", (data) => {
      console.log("Received chat history:", data);
      const room = data.room;
      const formattedHistory = data.history.flatMap((entry) => [
        { sender: "user", message: `${entry.username} : ${entry.prompt}`, profilePic: entry.profilePic || "https://via.placeholder.com/40?text=U", userId: entry.userId },
        { sender: "bot", message: `Bot : ${entry.response}`, profilePic: "https://via.placeholder.com/40?text=B", userId: "000" },
      ]);
      setChatHistory((prev) => ({
        ...prev,
        [room]: formattedHistory,
      }));
      setIsLoading(false);
    });

    // Cleanup WebSocket listeners
    return () => {
      socket.off("onLog");
      socket.off("chatHistory");
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  // Scroll to the latest message when chat history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, selectedRoom]);

  // Join a room
  const joinRoom = (room) => {
    setSelectedRoom(room);
    setIsLoading(true);
    socket.emit("joinRoom", { userId: 1, room });
    setShowSuggestions(false); // Reset suggestions when switching rooms
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

  // Send a prompt to the backend
  const sendPrompt = async () => {
    if (inputMessage.trim() !== "" && selectedRoom) {
      setIsSending(true);
      try {
        const response = await fetch(`${head}/openai/process-textd`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "1",
            prompt: inputMessage,
            room: selectedRoom,
            username: username,
            profilePic: "https://via.placeholder.com/40?text=" + username.charAt(0),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setInputMessage("");
        setShowSuggestions(false); // Close suggestions after sending
      } catch (error) {
        console.error("Error sending prompt:", error);
        alert("Failed to send prompt!");
      } finally {
        setIsSending(false);
      }
    } else if (!selectedRoom) {
      alert("Please select a room first!");
    }
  };

  // Open profile modal
  const openProfileModal = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  // Close profile modal
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
  };

  // Get room title based on selected room
  const getRoomTitle = () => {
    switch (selectedRoom) {
      case "sports":
        return "ห้องกีฬา";
      case "tech":
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
          onClick={() => joinRoom("sports")}
        >
          <h2 className="text-lg font-bold mb-2">ห้องกีฬา</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">คุยเรื่องกีฬาทุกประเภท</p>
        </div>
        <div
          className="p-4 bg-gray-800 dark:bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300 transition"
          onClick={() => joinRoom("tech")}
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
              const storedUsername = sessionStorage.getItem("chatUsername");
              const isCurrentUser = displayUsername === storedUsername;

              return (
                <div
                  key={index}
                  className={`mb-4 break-words flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}>
                    <img
                      src={msg.profilePic}
                      alt={`${displayUsername}'s profile`}
                      className="w-8 h-8 rounded-full cursor-pointer"
                      onClick={() => openProfileModal({ username: displayUsername, profilePic: msg.profilePic, userId: msg.userId })}
                    />
                    <div className={isCurrentUser ? "text-right" : "text-left"}>
                      <div
                        className="text-white-400 font-bold text-sm cursor-pointer"
                        onClick={() => openProfileModal({ username: displayUsername, profilePic: msg.profilePic, userId: msg.userId })}
                      >
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

      {/* Profile Modal */}
      {isClient && isProfileModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 dark:bg-gray-200 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Profile</h2>
              <button
                onClick={closeProfileModal}
                className="text-gray-400 hover:text-gray-200 dark:text-gray-600 dark:hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.profilePic}
                  alt={`${selectedUser.username}'s profile`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="text-lg font-semibold">{selectedUser.username}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-600">Role: นักเตะเก่งที่สุดในโลก</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 dark:text-gray-700">
                This is a mock profile. More details can be added via backend integration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}