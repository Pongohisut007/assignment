'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // รอ 3 วินาทีก่อนเปลี่ยนจาก loading เป็น success
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);

        // รอเพิ่มอีก 2 วินาที (รวม 5 วินาที) แล้ว redirect
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 text-sky-500 hover:text-sky-600 text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md"
      >
        ← Home
      </button>
      <div className="relative py-6 w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl p-10">
          <h1 className="text-gray-500 text-2xl font-semibold text-center">Register</h1>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                className="peer placeholder-transparent w-full h-10 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-sky-500"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
              <label
                htmlFor="username"
                className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
              >
                Username
              </label>
            </div>

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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <label
                htmlFor="password"
                className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
              >
                Password
              </label>
            </div>
            <div>
            <div className="text-center flex justify-end text-sm text-gray-600">
  มีบัญชีแล้ว ? {' '}
  <Link href="/login" className="ml-1 text-sky-500 hover:text-sky-600 font-medium">
    เข้าสู่ระบบ
  </Link>
</div>
            <button
              type="submit"
              className="w-full bg-cyan-500 text-white rounded-md py-2 mt-4 hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
              </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {(isLoading || isSuccess) && (
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
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-t-cyan-500 border-gray-300 rounded-full"
                  />
                  <p className="mt-4 text-gray-700">กำลังตรวจสอบ</p>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-12 h-12 text-green-500" />
                  <p className="mt-4 text-gray-700">กำลังพาไปยังหน้า login</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}