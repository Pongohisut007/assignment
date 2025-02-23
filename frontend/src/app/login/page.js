"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
    // TODO: ส่งข้อมูลไป backend
  };

  return (
    

    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
       {/* 🔙 ปุ่มย้อนกลับที่มุมซ้ายบน */}
       <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-sky-500 hover:text-sky-600 text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md"
      >
        ← Go Back
      </button>
      <div className="relative py-6 w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl p-10">
          <h1 className="text-gray-500 text-2xl font-semibold text-center">Login</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-sky-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
              >
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-sky-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label
                htmlFor="password"
                className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
              >
                Password
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 text-white rounded-md py-2 mt-4 hover:bg-cyan-600 transition"
            >
              Login
            </button>
          </form>

          <div className="w-full flex justify-center mt-4">
            <button className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition">
              <svg className="h-6 w-6 mr-2" viewBox="-0.5 0 48 48">
                <path fill="#FBBC05" d="M9.8,24c0-1.5,0.3-3,0.7-4.4L2.6,13.6C1.1,16.7,0.2,20.3,0.2,24s0.9,7.3,2.4,10.4l7.9-6.1C10.1,26,9.8,25,9.8,24z"/>
                <path fill="#EB4335" d="M23.7,10.1c3.3,0,6.3,1.2,8.7,3.1l6.8-6.8C35,2.8,29.7,0.5,23.7,0.5c-9.3,0-17.3,5.3-21,13.1l7.9,6.1C12.4,14.1,17.5,10.1,23.7,10.1z"/>
                <path fill="#34A853" d="M23.7,37.9c-6.2,0-11.3-4-13.2-9.5l-7.9,6.1c3.8,7.2,11.8,12.3,21,12.3c5.7,0,11.1-2,15.3-5.8l-7.5-5.8C29.4,37.1,26.7,37.9,23.7,37.9z"/>
                <path fill="#4285F4" d="M46.1,24c0-1.4-0.2-2.9-0.5-4.3H23.7V28.8h12.6c-0.6,3-2.3,5.4-4.8,7l7.5,5.8C43.3,37.6,46.1,31.6,46.1,24z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
