"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", content: "", tags: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const newSocket = io("http://localhost:9002", { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.emit("getThreads");
    newSocket.on("threads", (data) => {
      setThreads(data);
    });

    return () => newSocket.disconnect();
  }, []);

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content) return;

    const threadData = {
      title: newThread.title,
      content: newThread.content,
      tags: newThread.tags.split(",").map((tag) => tag.trim()),
      timestamp: new Date().toISOString(),
    };

    socket.emit("createThread", threadData);
    setNewThread({ title: "", content: "", tags: "" });
    setIsModalOpen(false); // ปิด Modal หลังจากสร้าง
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white dark:bg-gray-100 dark:text-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* ปุ่มเปิด Modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          + สร้างกระทู้ใหม่
        </button>

        {/* Modal สำหรับสร้างกระทู้ */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 dark:bg-gray-200 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">สร้างกระทู้ใหม่</h2>
              <form onSubmit={handleCreateThread} className="space-y-4">
                <input
                  type="text"
                  placeholder="หัวข้อกระทู้"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  className="w-full p-2 rounded text-black dark:bg-gray-100"
                />
                <textarea
                  placeholder="เนื้อหากระทู้"
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  className="w-full p-2 rounded text-black dark:bg-gray-100 h-32"
                />
                <input
                  type="text"
                  placeholder="แท็ก (คั่นด้วย ,)"
                  value={newThread.tags}
                  onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                  className="w-full p-2 rounded text-black dark:bg-gray-100"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 dark:bg-gray-300 dark:hover:bg-gray-400 dark:text-black"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    สร้าง
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* การ์ดกระทู้ */}
        <div className="space-y-6">
          {threads.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-600">ยังไม่มีกระทู้</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Link href={`/forum/${thread.id}`}>
                  <h2 className="text-xl font-semibold text-blue-400 dark:text-blue-600 hover:underline">
                    {thread.title}
                  </h2>
                </Link>
                <p className="mt-2 text-gray-300 dark:text-gray-700">
                  {thread.content.substring(0, 150)}...
                </p>
                <div className="mt-2 text-sm text-gray-400 dark:text-gray-600">
                  <span>โพสต์เมื่อ: {new Date(thread.timestamp).toLocaleString()}</span> |{" "}
                  <span>แท็ก: {thread.tags.join(", ")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}