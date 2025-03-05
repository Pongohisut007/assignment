"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useTheme } from "next-themes";

const head = "http://localhost:3000"; // URL ของ backend
const socket = io("http://localhost:9002", { transports: ["websocket"] }); // URL ของ WebSocket

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState(null); // ห้องที่เลือก
  const [chatHistory, setChatHistory] = useState({ sports: [], tech: [] }); // ประวัติแชทแยกตามห้อง
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [username, setUsername] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // สถานะ Modal
  const [selectedUser, setSelectedUser] = useState(null); // ข้อมูลผู้ใช้ที่เลือก
  const { theme } = useTheme();
  const messagesEndRef = useRef(null);

  // ตั้งค่า username
  const checkAndSetUsername = () => {
    const storedUsername = sessionStorage.getItem("chatUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const newUsername = `User-${Math.floor(Math.random() * 10000)}`;
      setUsername(newUsername);
      sessionStorage.setItem("chatUsername", newUsername);
    }
  };

  useEffect(() => {
    const userId = 1; // สมมติ userId
    checkAndSetUsername();

    // Mock ข้อความเริ่มต้นพร้อมโปรไฟล์
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

    return () => {
      socket.off("onLog");
      socket.off("chatHistory");
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, selectedRoom]);

  // เข้าร่วมห้อง
  const joinRoom = (room) => {
    setSelectedRoom(room);
    setIsLoading(true);
    socket.emit("joinRoom", { userId: 1, room });
  };

  // ส่ง prompt
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

  // เปิด Modal โปรไฟล์
  const openProfileModal = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  // ปิด Modal โปรไฟล์
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
  };

  // หัวข้อห้องแชท
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
          <h2 className="text-lg font-bold">ห้องกีฬา</h2>
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
          <h1 className="text-2xl font-bold text-white dark:text-black">{getRoomTitle()}</h1>
        </div>

        {/* Chat Display Area */}
        <div className="p-4 flex-grow overflow-y-auto rounded-lg w-full max-w-[50rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:p-4 sm:h-80 sm:mb-4 sm:max-w-[50rem] mx-auto">
          {(!selectedRoom || chatHistory[selectedRoom]?.length === 0) && !isLoading && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {selectedRoom ? "No messages yet. Start chatting!" : "Please select a room to start chatting!"}
            </div>
          )}
          {selectedRoom &&
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

        {/* Input Box for Sending Prompt */}
        <div className="flex space-x-2 bg-[#313335] p-4 rounded-3xl w-full max-w-[50rem] mx-auto sm:p-6 sm:rounded-3xl shrink-0">
          <input
            type="text"
            className="flex-grow bg-[#313335] outline-none text-white text-sm sm:text-base"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
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
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && selectedUser && (
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