'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../RootLayout.client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false); // เพิ่ม state สำหรับ hydration
  const router = useRouter();
  const { login } = useAuth();

  const localA = "http://localhost:3001/";
  const realA = "https://nongao.lol-th-no1.com"
  // Sync hydration
  useEffect(() => {
    setHydrated(true); // ตั้งค่า hydrated เป็น true หลังจาก client โหลด
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${realA}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.text();

      if (!response.ok) {
        let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
        try {
          const errorData = JSON.parse(data);
          console.log('Error data from backend:', errorData);
          if (errorData.message === 'User not found') {
            errorMessage = 'ไม่มีบัญชีนี้ในระบบ';
          } else if (errorData.message === 'Invalid password') {
            errorMessage = 'รหัสผ่านหรือชื่อบัญชีไม่ถูกต้อง';
          } else if (errorData.message === 'Password or user data is missing') {
            errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const token = data;

      const userResponse = await fetch(`${realA}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await userResponse.json();
      console.log("data = ", userData);
      if (!userResponse.ok) {
        throw new Error(userData.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }
      
      document.cookie = `user=${JSON.stringify({ email: userData.email, role: userData.role, user_id: userData.user_id })}; path=/; max-age=3600`;
      document.cookie = `token=${token}; path=/; max-age=3600; httpOnly`;
      document.cookie = `isLoggedIn=true; path=/; max-age=3600`;

      login({
        email: userData.email || emailOrUsername,
        role: userData.role,
        user_id:userData.user_id,
        username:userData.username
      });

      setIsLoading(false);
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // รอ hydration เสร็จก่อน render
  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Link href="/" className="absolute top-4 left-4">
        <button className="text-sky-500 hover:text-sky-600 text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md">
          ← Home
        </button>
      </Link>

      <div className="relative py-6 w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl p-10">
          <h1 className="text-gray-500 text-2xl font-semibold text-center">Login</h1>

          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">
                Username/Email
              </label>
              <input
                type="text"
                id="emailOrUsername"
                placeholder="Email or Username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                disabled={isLoading}
                className="w-full border p-2 dark:bg-gray-50 rounded text-gray-800 mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full dark:bg-gray-50 border p-2 rounded text-gray-800 mt-1"
              />
            </div>

            <div className="text-center flex justify-end text-sm text-gray-600">
              ยังไม่มีบัญชี ?{' '}
              <Link href="/register" className="ml-1 text-sky-500 hover:text-sky-600 font-medium">
                สมัครสมาชิก
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 text-white rounded-md py-2 mt-4 hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-12 h-12 border-4 border-t-cyan-500 border-gray-300 rounded-full"
              />
              <p className="mt-4 text-gray-700">กำลังเข้าสู่ระบบ</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 