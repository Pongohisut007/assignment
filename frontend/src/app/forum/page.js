"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import styles from "./Forum.module.css";

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", content: "", tagIds: [] });
  const [tags, setTags] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { theme } = useTheme();
  const threadsEndRef = useRef(null);

  const API_BASE_URL = "https://nongao.lol-th-no1.com";

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  useEffect(() => {
    const userCookie = getCookie("user");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
    fetchThreads();
    fetchTags();
  }, []);

  useEffect(() => {
    threadsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/post`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setThreads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching threads:", error);
      setThreads([]);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tag`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTags([]);
    }
  };

  const handleTagChange = (tagId) => {
    setNewThread((prev) => {
      const tagIds = prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId];
      return { ...prev, tagIds };
    });
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content || !currentUser) return;
    setIsLoading(true);
    const threadData = {
      owner: currentUser?.user_id || 1,
      subject: newThread.title,
      content: newThread.content,
      tagIds: newThread.tagIds,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(threadData),
      });
      if (!response.ok) throw new Error("Failed to create post");
      const result = await response.json();
      const newPostWithAIComment = {
        ...result.newPost,
        comments: [{ comment: result.aiResponse, owner: { user_id: 3, username: "GPT" } }],
      };
      setThreads((prev) => [...prev, newPostWithAIComment]);
      setNewThread({ title: "", content: "", tagIds: [] });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating thread:", error);
      alert("เกิดข้อผิดพลาดในการสร้างกระทู้");
    } finally {
      setIsLoading(false);
    }
  };

  const openThreadModal = (thread) => {
    setSelectedThread(thread);
    setComments(thread.comments || []);
    setReplyInputs({});
  };

  const closeThreadModal = () => {
    setSelectedThread(null);
    setComments([]);
    setNewComment("");
    setReplyInputs({});
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment || !selectedThread || !currentUser) return;
    const commentData = {
      owner: currentUser?.user_id || 1,
      post_id: selectedThread.post_id,
      comment: newComment,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error("Failed to create comment");
      const newCommentData = await response.json();
      setComments((prev) => [...prev, { ...newCommentData, sub_comments: [] }]);
      setThreads((prev) =>
        prev.map((thread) =>
          thread.post_id === selectedThread.post_id
            ? { ...thread, comments: [...(thread.comments || []), newCommentData] }
            : thread
        )
      );
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("เกิดข้อผิดพลาดในการสร้างคอมเมนต์");
    }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    const replyText = replyInputs[commentId];
    if (!replyText || !currentUser) return;
    const subCommentData = {
      owner: currentUser?.user_id || 1,
      comment_id: commentId,
      sub_comment: replyText,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/sub-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subCommentData),
      });
      if (!response.ok) throw new Error("Failed to create sub-comment");
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
      alert("เกิดข้อผิดพลาดในการสร้างการตอบกลับ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white dark:bg-gray-100 dark:text-black p-4 md:p-6">
      <div className="max-w-full mx-auto md:max-w-4xl">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md transition-colors duration-300 w-full md:w-auto"
          disabled={!currentUser}
        >
          + สร้างกระทู้ใหม่
        </button>

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 dark:bg-gray-200 p-4 rounded-xl w-full max-w-md shadow-2xl relative border border-gray-700 dark:border-gray-300">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-2 right-2 w-8 h-8 bg-gray-700 dark:bg-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-200 dark:text-gray-600 dark:hover:text-gray-800 text-xl font-bold"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-100 dark:text-gray-900 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent md:text-2xl">
                สร้างกระทู้ใหม่
              </h2>
              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="หัวข้อกระทู้"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    className="w-full p-2 rounded-lg text-gray-200 dark:text-gray-900 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base md:p-3"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="เนื้อหากระทู้"
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    className="w-full p-2 rounded-lg text-gray-200 dark:text-gray-900 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400 resize-none h-24 text-sm md:text-base md:p-3 md:h-36"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-gray-200 dark:text-gray-900 mb-2 text-sm md:text-base">เลือกแท็ก:</label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {tags.length === 0 ? (
                      <p className="text-gray-400 dark:text-gray-600">ไม่มีแท็กให้เลือก</p>
                    ) : (
                      tags.map((tag) => (
                        <label key={tag.tag_id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newThread.tagIds.includes(tag.tag_id)}
                            onChange={() => handleTagChange(tag.tag_id)}
                            className="w-4 h-4 text-blue-600 bg-gray-900 dark:bg-gray-100 border-gray-600 dark:border-gray-300 rounded focus:ring-blue-500"
                            disabled={isLoading}
                          />
                          <span className="text-gray-200 dark:text-gray-900 text-sm md:text-base">{tag.tag_name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-gray-200 dark:bg-gray-300 dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-400 text-sm md:text-base"
                    disabled={isLoading}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-sm md:text-base disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        กำลังสร้าง...
                      </span>
                    ) : (
                      "สร้าง"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex-grow overflow-y-auto rounded-lg max-h-[calc(100vh-12rem)] md:max-h-[75vh] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-track]:bg-gray-200">
          {threads.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-600 p-4">ยังไม่มีกระทู้</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.post_id}
                className="bg-gray-700 dark:bg-gray-200 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer mb-4 md:p-4 md:mb-6"
                onClick={() => openThreadModal(thread)}
              >
                <h2 className="text-lg font-semibold text-blue-400 dark:text-blue-600 hover:underline md:text-xl">
                  {thread.subject}
                </h2>
                <p className="mt-1 text-gray-300 dark:text-gray-700 text-sm md:text-base md:mt-2">
                  {thread.content.substring(0, 100)}...
                </p>
                <div className="mt-1 text-xs text-gray-400 dark:text-gray-600 md:mt-2 md:text-sm">
                  <span>โพสต์เมื่อ: {new Date(thread.created_at || thread.timestamp).toLocaleString()}</span> |{" "}
                  <span>แท็ก: {(thread.tags || []).map((tag) => tag.tag_name || tag).join(", ")}</span>
                </div>
              </div>
            ))
          )}
          <div ref={threadsEndRef} />
        </div>

        {selectedThread && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`bg-gray-800 dark:bg-gray-200 p-4 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto ${styles.customScrollbar} shadow-2xl relative md:p-6 md:max-w-2xl`}
            >
              <button
                onClick={closeThreadModal}
                className="absolute top-2 right-2 w-8 h-8 bg-gray-700 dark:bg-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-200 dark:text-gray-600 dark:hover:text-gray-800 text-xl font-bold"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-100 dark:text-gray-900 md:text-2xl">{selectedThread.subject}</h2>
              <p className="text-gray-300 dark:text-gray-700 mb-4 leading-relaxed text-sm md:text-base md:mb-6">{selectedThread.content}</p>
              <div className="text-xs text-gray-400 dark:text-gray-600 mb-4 md:text-sm md:mb-6">
                <span>โพสต์เมื่อ: {new Date(selectedThread.created_at || selectedThread.timestamp).toLocaleString()}</span> |{" "}
                <span>แท็ก: {(selectedThread.tags || []).map((tag) => tag.tag_name || tag).join(", ")}</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-100 dark:text-gray-900 md:text-lg">ความคิดเห็น</h3>
                {comments.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-600 italic">ยังไม่มีคอมเมนต์</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.comment_id} className="space-y-2">
                      <div className="bg-gray-700 dark:bg-gray-300 p-3 rounded-lg shadow-md flex items-start space-x-3 md:p-4 md:space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold md:w-10 md:h-10">
                          {comment.owner?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-100 dark:text-gray-900 font-semibold text-sm md:text-base">{comment.owner?.username || "Unknown"}</p>
                          <p className="text-gray-200 dark:text-gray-800 mt-1 text-sm md:text-base">{comment.comment}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-600 mt-1 block">
                            {new Date(comment.created_at || comment.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={() => setReplyInputs((prev) => ({ ...prev, [comment.comment_id]: prev[comment.comment_id] || "" }))}
                            className="mt-1 text-xs text-blue-400 hover:text-blue-500 dark:text-blue-600 dark:hover:text-blue-700 underline md:mt-2 md:text-sm"
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {comment.sub_comments && comment.sub_comments.length > 0 && (
                        <div className="ml-6 space-y-2 md:ml-12">
                          {comment.sub_comments.map((subComment) => (
                            <div
                              key={subComment.sub_comment_id}
                              className={`bg-gray-600 dark:bg-gray-400 p-2 rounded-lg shadow-sm flex items-start space-x-2 ${styles.replyConnector} md:p-3 md:space-x-3`}
                            >
                              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold md:w-8 md:h-8">
                                {subComment.owner?.username?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-100 dark:text-gray-900 font-semibold text-sm md:text-base">{subComment.owner?.username || "Unknown"}</p>
                                <p className="text-gray-200 dark:text-gray-800 mt-1 text-sm md:text-base">{subComment.sub_comment}</p>
                                <span className="text-xs text-gray-400 dark:text-gray-600 mt-1 block">
                                  {new Date(subComment.created_at || subComment.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyInputs[comment.comment_id] !== undefined && (
                        <form onSubmit={(e) => handleReplySubmit(e, comment.comment_id)} className="ml-6 mt-2 flex flex-col space-y-2 md:ml-12">
                          <textarea
                            placeholder={`Reply to ${comment.owner?.username || "Unknown"}...`}
                            value={replyInputs[comment.comment_id]}
                            onChange={(e) => setReplyInputs((prev) => ({ ...prev, [comment.comment_id]: e.target.value }))}
                            className="w-full p-2 rounded-lg text-black dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner resize-none h-16 text-sm md:text-base md:h-20"
                          />
                          <button
                            type="submit"
                            className="self-end px-3 py-1 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 dark:from-green-400 dark:to-teal-500 dark:hover:from-green-500 dark:hover:to-teal-600 text-sm md:text-base"
                          >
                            ส่งคำตอบ
                          </button>
                        </form>
                      )}
                    </div>
                  ))
                )}

                <form onSubmit={handleCommentSubmit} className="mt-4 flex flex-col space-y-2 md:mt-6 md:space-y-3">
                  <textarea
                    placeholder="แสดงความคิดเห็น..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 rounded-lg text-black dark:bg-gray-100 border border-gray-600 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner resize-none h-20 text-sm md:text-base md:h-24"
                  />
                  <button
                    type="submit"
                    className="self-end px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-sm md:text-base md:px-6 md:py-2"
                    disabled={!currentUser}
                  >
                    ส่งความคิดเห็น
                  </button>
                </form>
              </div>

              <button
                onClick={closeThreadModal}
                className="mt-4 px-4 py-1 bg-gray-600 rounded-lg hover:bg-gray-700 dark:bg-gray-300 dark:hover:bg-gray-400 dark:text-black text-sm md:text-base md:mt-6 md:px-6 md:py-2"
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