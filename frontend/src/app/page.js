"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import styles from "./HomePage.module.css";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [realTimeData, setRealTimeData] = useState("");
  const router = useRouter();
  const starsContainerRef = useRef(null);

  // WebSocket logic
  useEffect(() => {
    const cookieStore = document.cookie;
    const isLoggedInCookie = cookieStore.includes("isLoggedIn=true");
    setIsLoggedIn(isLoggedInCookie);

    const socket = io("https://nongao.lol-th-no1.com", {
      path: "/socket.io/",
      transports: ["websocket", "polling"], // ระบุชัดเจน
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on("connect", () => {
      console.log("เชื่อมต่อสำเร็จ, Transport:", socket.io.engine.transport.name);
      socket.emit("joinRoom", 1);
      // socket.emit("newPrompt", { userId: 1, prompt: "สวัสดีจากสคริปต์!" });
      socket.emit("newPrompt", { userId: 1, prompt: "ท่อง a-z" });
    });
    
    socket.on("connect_error", (error) => {
      console.error("ข้อผิดพลาดการเชื่อมต่อ:", error.message, error);
    });

    socket.on("disconnect", () => {
      console.log("ตัดการเชื่อมต่อจากเซิร์ฟเวอร์");
    });

    socket.on("onMessage", (data) => {
      console.log("รับข้อความ:", data);
      setRealTimeData(JSON.stringify(data));
    });

    socket.on("realTimeData", (data) => {
      console.log("รับข้อมูลเรียลไทม์:", data);
      setRealTimeData(data);
    });

    socket.emit("newMessage", "สวัสดีจาก Next.js");

    return () => {
      socket.disconnect();
      console.log("ตัดการเชื่อมต่อจากเซิร์ฟเวอร์ WebSocket");
    };
  }, []);

  // Logic สำหรับสร้างดาวแบบสุ่ม (ไม่มีการเปลี่ยนแปลง)
  useEffect(() => {
    const container = starsContainerRef.current;
    if (!container) return;

    const createStars = () => {
      container.innerHTML = "";
      for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = styles.star;
        star.style.top = `${Math.random() * window.innerHeight}px`;
        star.style.left = `${Math.random() * window.innerWidth}px`;
        star.style.animationDuration = `${Math.random() * 5 + 5}s`;
        star.style.animationDelay = `${Math.random() * 1 + 1}s`;
        container.appendChild(star);
      }
    };

    createStars();

    const handleResize = () => {
      createStars();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-900 dark:bg-gray-100 overflow-hidden">
      <div ref={starsContainerRef} className="absolute inset-0 pointer-events-none"></div>

      <main className="relative flex flex-col sm:flex-row gap-8 row-start-2 items-center justify-between w-full max-w-5xl z-10">
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-white dark:text-black">
            Small AI
          </h1>
          <p className="text-sm sm:text-base text-gray-300 dark:text-gray-700 max-w-md">
            การผสานระหว่าง IoT และ Website โดยใช้ไมค์ในการเปลี่ยนภาษาและส่งออกข้อมูลแบบ Real-time บนหน้าจอแสดงผล
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            ข้อมูลเรียลไทม์: {realTimeData || "รอข้อมูล..."}
          </p>
          <div className="flex gap-4 items-center justify-center sm:justify-start flex-col sm:flex-row">
            <Link href={isLoggedIn ? "/Translation" : "/login"} legacyBehavior>
              <a className="bg-gray-700 dark:bg-gray-200 rounded-full border border-solid border-gray-600 dark:border-gray-300 transition-colors flex items-center justify-center text-white dark:text-black gap-2 hover:bg-gray-600 dark:hover:bg-gray-300 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                <Image
                  src="/vercel.svg"
                  alt="Vercel logomark"
                  width={20}
                  height={20}
                />
                เริ่มการทำงาน
              </a>
            </Link>
          </div>
        </div>
        <div className="flex-shrink-0 sm:ml-auto">
          <Image
            src="/TranslationPig.jpg"
            alt="Illustration of a pig for translation feature"
            width={600}
            height={900}
            priority
            className=""
          />
        </div>
      </main>
    </div>
  );
}