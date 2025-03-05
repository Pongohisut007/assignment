"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [realTimeData, setRealTimeData] = useState("");
  const router = useRouter();

  useEffect(() => {
    const cookieStore = document.cookie;
    const isLoggedInCookie = cookieStore.includes("isLoggedIn=true");
    setIsLoggedIn(isLoggedInCookie);

    const socket = io("http://localhost:9002", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    socket.on("onMessage", (data) => {
      console.log("Received message:", data);
      setRealTimeData(JSON.stringify(data));
    });

    socket.on("realTimeData", (data) => {
      console.log("Received real-time data:", data);
      setRealTimeData(data);
    });

    socket.emit("newMessage", "Hello from Next.js");

    return () => {
      socket.disconnect();
      console.log("Disconnected from WebSocket server");
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-8  00 dark:bg-gray-100">
      <main className="flex flex-col sm:flex-row gap-8 row-start-2 items-center justify-between w-full max-w-5xl">
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-white dark:text-black">
            Small AI
          </h1>
          <p className="text-sm sm:text-base text-gray-300 dark:text-gray-700 max-w-md">
            การผสานระหว่าง IoT และ Website โดยใช้ไมค์ในการเปลี่ยนภาษาและส่งออกข้อมูลแบบ Real-time บนหน้าจอแสดงผล
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            Real-time Data: {realTimeData || "Waiting for data..."}
          </p>
          <div className="flex gap-4 items-center justify-center sm:justify-start flex-col sm:flex-row">
            <Link href={isLoggedIn ? "/Translation" : "/login"} legacyBehavior>
              <a className="dark:bg-gray-700 bg-gray-600 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-gray-300 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                <Image
                  className="text-gray-700"
                  src="/vercel.svg"
                  alt="Vercel logomark"
                  width={20}
                  height={20}
                />
                <a className="text-gray-100 ">
                เริ่มการทำงาน</a>
              </a>
            </Link>
          </div>
        </div>
        <div className="flex-shrink-0 sm:ml-auto">
          <Image
            src="/TranslationPig.jpg"
            alt="Microphone illustration"
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