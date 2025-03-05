"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import styles from "./Forum.module.css";

// Mock Data สำหรับกระทู้
const mockThreads = [
  {
    id: 1,
    title: "แนะนำร้านกาแฟในกรุงเทพ",
    content: "สวัสดีครับ ผมอยากได้คำแนะนำร้านกาแฟน่านั่งในกรุงเทพหน่อยครับ ชอบบรรยากาศเงียบ ๆ และกาแฟรสชาติดี มีใครแนะนำได้บ้างครับ?",
    tags: ["กาแฟ", "กรุงเทพ", "ร้านนั่ง"],
    timestamp: "2025-03-04T10:00:00Z",
  },
  {
    id: 2,
    title: "วิธีดูแลต้นไม้ในร่ม",
    content: "ผมเพิ่งซื้อต้นไม้ในร่มมาเลี้ยงที่บ้าน แต่ไม่แน่ใจว่าต้องรดน้ำบ่อยแค่ไหน และดูแลยังไงให้ต้นไม้ไม่ตาย ใครมีเคล็ดลับบ้างครับ?",
    tags: ["ต้นไม้", "ในร่ม", "การดูแล"],
    timestamp: "2025-03-04T12:30:00Z",
  },
  {
    id: 3,
    title: "รีวิวหนังใหม่ Netflix",
    content: "เมื่อคืนดูหนังใหม่ใน Netflix เรื่อง 'The Night Agent' มา สนุกมาก! เนื้อเรื่องลุ้นระทึกตลอดเวลา เพื่อน ๆ ดูเรื่องนี้กันหรือยัง?",
    tags: ["หนัง", "Netflix", "รีวิว"],
    timestamp: "2025-03-04T15:45:00Z",
  },
];

// Mock Data สำหรับคอมเมนต์ (เพิ่ม replies)
const mockComments = {
  1: [
    { 
      id: 1,
      threadId: 1, 
      text: "แนะนำร้าน Casa Lapin ค่ะ บรรยากาศดีมาก", 
      sender: "Alice", 
      timestamp: "2025-03-04T10:05:00Z",
      replies: [
        { id: 4, threadId: 1, text: "เห็นด้วยเลย ร้านนี้เงียบดีจริง", sender: "Eve", timestamp: "2025-03-04T10:07:00Z" }
      ]
    },
    { 
      id: 2,
      threadId: 1, 
      text: "ผมชอบ Roots ตรงสยามครับ กาแฟเข้มดี", 
      sender: "Bob", 
      timestamp: "2025-03-04T10:10:00Z",
      replies: []
    },
  ],
  2: [
    { 
      id: 3,
      threadId: 2, 
      text: "รดน้ำสัปดาห์ละครั้งก็พอครับ แต่ต้องดูแสงด้วย", 
      sender: "Charlie", 
      timestamp: "2025-03-04T12:35:00Z",
      replies: []
    },
  ],
  3: [
    { 
      id: 5,
      threadId: 3, 
      text: "ยังไม่ได้ดูเลย เดี๋ยวต้องไปลอง!", 
      sender: "Dave", 
      timestamp: "2025-03-04T15:50:00Z",
      replies: []
    },
    { 
      id: 6,
      threadId: 3, 
      text: "สนุกจริงครับ ตอนจบพีคมาก", 
      sender: "Eve", 
      timestamp: "2025-03-04T15:55:00Z",
      replies: []
    },
  ],
};

export default function Forum() {
  const [threads, setThreads] = useState(mockThreads);
  const [newThread, setNewThread] = useState({ title: "", content: "", tags: "" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const { theme } = useTheme();

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content) return;

    const threadData = {
      id: threads.length + 1,
      title: newThread.title,
      content: newThread.content,
      tags: newThread.tags.split(",").map((tag) => tag.trim()),
      timestamp: new Date().toISOString(),
    };

    setThreads((prev) => [...prev, threadData]);
    setNewThread({ title: "", content: "", tags: "" });
    setIsCreateModalOpen(false);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment || !selectedThread) return;

    const commentData = {
      id: comments.length + Date.now(),
      threadId: selectedThread.id,
      text: newComment,
      sender: "You",
      timestamp: new Date().toISOString(),
      replies: [],
    };

    setComments((prev) => [...prev, commentData]);
    setNewComment("");
  };

  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    const replyText = replyInputs[commentId];
    if (!replyText) return;

    const replyData = {
      id: comments.length + Date.now() + Math.random(),
      threadId: selectedThread.id,
      text: replyText,
      sender: "You",
      timestamp: new Date().toISOString(),
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, replyData] }
          : comment
      )
    );
    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
  };

  const openThreadModal = (thread) => {
    setSelectedThread(thread);
    const threadComments = mockComments[thread.id] || [];
    setComments(threadComments);
    setReplyInputs({});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white dark:bg-gray-100 dark:text-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* ปุ่มเปิด Modal สร้างกระทู้ */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md transition-colors duration-300"
        >
          + สร้างกระทู้ใหม่
        </button>

        {/* Modal สร้างกระทู้ */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 dark:bg-gray-200 p-6 rounded-lg w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4">สร้างกระทู้ใหม่</h2>
              <form onSubmit={handleCreateThread} className="space-y-4">
                <input
                  type="text"
                  placeholder="หัวข้อกระทู้"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  className="w-full p-2 rounded-lg text-black dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="เนื้อหากระทู้"
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  className="w-full p-2 rounded-lg text-black dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                />
                <input
                  type="text"
                  placeholder="แท็ก (คั่นด้วย ,)"
                  value={newThread.tags}
                  onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                  className="w-full p-2 rounded-lg text-black dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 dark:bg-gray-300 dark:hover:bg-gray-400 dark:text-black shadow-md transition-colors duration-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md transition-colors duration-300"
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
                className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openThreadModal(thread)}
              >
                <h2 className="text-xl font-semibold text-blue-400 dark:text-blue-600 hover:underline">
                  {thread.title}
                </h2>
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

        {/* Modal แสดงเนื้อหากระทู้และคอมเมนต์ */}
        {selectedThread && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`bg-gray-800 dark:bg-gray-200 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] ${styles.customScrollbar} shadow-2xl`}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-100 dark:text-gray-900">{selectedThread.title}</h2>
              <p className="text-gray-300 dark:text-gray-700 mb-6 leading-relaxed">{selectedThread.content}</p>
              <div className="text-sm text-gray-400 dark:text-gray-600 mb-6">
                <span>โพสต์เมื่อ: {new Date(selectedThread.timestamp).toLocaleString()}</span> |{" "}
                <span>แท็ก: {selectedThread.tags.join(", ")}</span>
              </div>

              {/* ช่องคอมเมนต์ */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-900">ความคิดเห็น</h3>
                {comments.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-600 italic">ยังไม่มีคอมเมนต์</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="relative space-y-2">
                      <div className="bg-gray-700 dark:bg-gray-300 p-4 rounded-lg shadow-md flex items-start space-x-4 hover:bg-gray-600 dark:hover:bg-gray-200 transition-colors duration-200">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {comment.sender.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-100 dark:text-gray-900 font-semibold">{comment.sender}</p>
                          <p className="text-gray-200 dark:text-gray-800 mt-1">{comment.text}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-600 mt-1 block">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={() => setReplyInputs((prev) => ({ ...prev, [comment.id]: prev[comment.id] || "" }))}
                            className="mt-2 text-sm text-blue-400 hover:text-blue-500 dark:text-blue-600 dark:hover:text-blue-700 underline"
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {/* Replies กับเส้นเชื่อมโยง */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-12 relative space-y-2">
                          {comment.replies.map((reply, index) => (
                            <div
                              key={reply.id}
                              className={`bg-gray-600 dark:bg-gray-400 p-3 rounded-lg shadow-sm flex items-start space-x-3 ${styles.replyConnector}`}
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                {reply.sender.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-100 dark:text-gray-900 font-semibold">{reply.sender}</p>
                                <p className="text-gray-200 dark:text-gray-800 mt-1">{reply.text}</p>
                                <span className="text-xs text-gray-400 dark:text-gray-600 mt-1 block">
                                  {new Date(reply.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ฟอร์มตอบกลับ */}
                      {replyInputs[comment.id] !== undefined && (
                        <form
                          onSubmit={(e) => handleReplySubmit(e, comment.id)}
                          className="ml-12 mt-2 flex flex-col space-y-2"
                        >
                          <textarea
                            placeholder={`Reply to ${comment.sender}...`}
                            value={replyInputs[comment.id]}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({ ...prev, [comment.id]: e.target.value }))
                            }
                            className="w-full p-2 rounded-lg text-black dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner resize-none h-20"
                          />
                          <button
                            type="submit"
                            className="self-end px-4 py-1 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 dark:from-green-400 dark:to-teal-500 dark:hover:from-green-500 dark:hover:to-teal-600 shadow-md transition-all duration-300 transform hover:scale-105"
                          >
                            ส่งคำตอบ
                          </button>
                        </form>
                      )}
                    </div>
                  ))
                )}

                {/* ฟอร์มคอมเมนต์หลัก */}
                <form onSubmit={handleCommentSubmit} className="mt-6 flex flex-col space-y-3">
                  <textarea
                    placeholder="แสดงความคิดเห็น..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 rounded-lg text-black dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner resize-none h-24"
                  />
                  <button
                    type="submit"
                    className="self-end px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    ส่งความคิดเห็น
                  </button>
                </form>
              </div>

              <button
                onClick={() => setSelectedThread(null)}
                className="mt-6 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 dark:bg-gray-300 dark:hover:bg-gray-400 dark:text-black shadow-md transition-colors duration-300"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}