"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import styles from "./Forum.module.css";

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", content: "", tags: "" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const { theme } = useTheme();

  // URL ฐานของ API (ปรับตามที่อยู่ backend ของคุณ)
  const API_BASE_URL = "http://localhost:3001";

  // ดึงกระทู้ทั้งหมดเมื่อโหลดหน้า
  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/post`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  // สร้างกระทู้ใหม่
  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content) return;

    const threadData = {
      owner: 1, // แทนด้วย ownerId จากระบบล็อกอิน (เช่นจาก context หรือ token)
      subject: newThread.title,
      content: newThread.content,
      tagIds: newThread.tags ? newThread.tags.split(",").map((tag) => parseInt(tag.trim())) : [],
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(threadData),
      });
      const result = await response.json();
      setThreads((prev) => [...prev, result.newPost]); // เพิ่มโพสต์ใหม่ใน UI
      setNewThread({ title: "", content: "", tags: "" });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  // ดึงคอมเมนต์เมื่อเลือกกระทู้
  const openThreadModal = (thread) => {
    setSelectedThread(thread);
    setComments(thread.comments || []); // คอมเมนต์มาจากข้อมูลโพสต์ที่ได้จาก API
    setReplyInputs({});
  };

  const closeThreadModal = () => {
    setSelectedThread(null);
    setComments([]);
    setNewComment("");
    setReplyInputs({});
  };

  // สร้างคอมเมนต์ใหม่
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment || !selectedThread) return;

    const commentData = {
      owner: 1, // แทนด้วย ownerId จากระบบล็อกอิน
      post: selectedThread.post_id,
      comment: newComment,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
      const newCommentData = await response.json();
      setComments((prev) => [...prev, { ...newCommentData, replies: [] }]);
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  // สร้างซับคอมเมนต์
  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    const replyText = replyInputs[commentId];
    if (!replyText) return;

    const subCommentData = {
      owner: 1, // แทนด้วย ownerId จากระบบล็อกอิน
      comment_id: commentId,
      sub_comment: replyText,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/sub-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subCommentData),
      });
      const newSubComment = await response.json();

      setComments((prev) =>
        prev.map((comment) =>
          comment.comment_id === commentId
            ? { ...comment, sub_comments: [...(comment.sub_comments || []), newSubComment] }
            : comment
        )
      );
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      console.error("Error creating sub-comment:", error);
    }
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
            <div className="bg-gray-800 dark:bg-gray-200 p-6 rounded-xl w-full max-w-md shadow-2xl relative border border-gray-700 dark:border-gray-300 transform transition-all duration-300 scale-100 hover:scale-105">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-gray-700 dark:bg-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-200 dark:text-gray-600 dark:hover:text-gray-800 text-xl font-bold transition-colors duration-200 hover:bg-gray-600 dark:hover:bg-gray-400"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-100 dark:text-gray-900 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">สร้างกระทู้ใหม่</h2>
              <form onSubmit={handleCreateThread} className="space-y-5">
                <div>
                  <input
                    type="text"
                    placeholder="หัวข้อกระทู้"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    className="w-full p-3 rounded-lg text-gray-200 dark:text-gray-900 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="เนื้อหากระทู้"
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    className="w-full p-3 rounded-lg text-gray-200 dark:text-gray-900 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm resize-none h-36 transition-all duration-200"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="แท็ก (คั่นด้วย , เช่น 1,2,3)"
                    value={newThread.tags}
                    onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                    className="w-full p-3 rounded-lg text-gray-200 dark:text-gray-900 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-200"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2 bg-gray-600 text-gray-200 dark:bg-gray-300 dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-400 shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-md transition-all duration-300 transform hover:scale-105"
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
                key={thread.post_id}
                className="bg-gray-800 dark:bg-gray-200 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openThreadModal(thread)}
              >
                <h2 className="text-xl font-semibold text-blue-400 dark:text-blue-600 hover:underline">
                  {thread.subject}
                </h2>
                <p className="mt-2 text-gray-300 dark:text-gray-700">
                  {thread.content.substring(0, 150)}...
                </p>
                <div className="mt-2 text-sm text-gray-400 dark:text-gray-600">
                  <span>โพสต์เมื่อ: {new Date(thread.created_at || thread.timestamp).toLocaleString()}</span> |{" "}
                  <span>แท็ก: {(thread.tags || []).map((tag) => tag.tag_name || tag).join(", ")}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal แสดงเนื้อหากระทู้และคอมเมนต์ */}
        {selectedThread && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`bg-gray-800 dark:bg-gray-200 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] ${styles.customScrollbar} shadow-2xl relative`}
            >
              <button
                onClick={closeThreadModal}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 dark:text-gray-600 dark:hover:text-gray-800 text-2xl font-bold transition-colors duration-200"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold mb-4 text-gray-100 dark:text-gray-900">{selectedThread.subject}</h2>
              <p className="text-gray-300 dark:text-gray-700 mb-6 leading-relaxed">{selectedThread.content}</p>
              <div className="text-sm text-gray-400 dark:text-gray-600 mb-6">
                <span>โพสต์เมื่อ: {new Date(selectedThread.created_at || selectedThread.timestamp).toLocaleString()}</span> |{" "}
                <span>แท็ก: {(selectedThread.tags || []).map((tag) => tag.tag_name || tag).join(", ")}</span>
              </div>

              {/* ช่องคอมเมนต์ */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-900">ความคิดเห็น</h3>
                {comments.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-600 italic">ยังไม่มีคอมเมนต์</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.comment_id} className="relative space-y-2">
                      <div className="bg-gray-700 dark:bg-gray-300 p-4 rounded-lg shadow-md flex items-start space-x-4 hover:bg-gray-600 dark:hover:bg-gray-200 transition-colors duration-200">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {comment.owner?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-100 dark:text-gray-900 font-semibold">{comment.owner?.username || "Unknown"}</p>
                          <p className="text-gray-200 dark:text-gray-800 mt-1">{comment.comment}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-600 mt-1 block">
                            {new Date(comment.created_at || comment.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={() => setReplyInputs((prev) => ({ ...prev, [comment.comment_id]: prev[comment.comment_id] || "" }))}
                            className="mt-2 text-sm text-blue-400 hover:text-blue-500 dark:text-blue-600 dark:hover:text-blue-700 underline"
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {/* Sub-comments */}
                      {comment.sub_comments && comment.sub_comments.length > 0 && (
                        <div className="ml-12 relative space-y-2">
                          {comment.sub_comments.map((subComment) => (
                            <div
                              key={subComment.sub_comment_id}
                              className={`bg-gray-600 dark:bg-gray-400 p-3 rounded-lg shadow-sm flex items-start space-x-3 ${styles.replyConnector}`}
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                {subComment.owner?.username?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-100 dark:text-gray-900 font-semibold">{subComment.owner?.username || "Unknown"}</p>
                                <p className="text-gray-200 dark:text-gray-800 mt-1">{subComment.sub_comment}</p>
                                <span className="text-xs text-gray-400 dark:text-gray-600 mt-1 block">
                                  {new Date(subComment.created_at || subComment.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ฟอร์มตอบกลับ */}
                      {replyInputs[comment.comment_id] !== undefined && (
                        <form
                          onSubmit={(e) => handleReplySubmit(e, comment.comment_id)}
                          className="ml-12 mt-2 flex flex-col space-y-2"
                        >
                          <textarea
                            placeholder={`Reply to ${comment.owner?.username || "Unknown"}...`}
                            value={replyInputs[comment.comment_id]}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({ ...prev, [comment.comment_id]: e.target.value }))
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
                onClick={closeThreadModal}
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