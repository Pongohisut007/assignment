'use client';

import { createContext, useContext, useState } from 'react';
import Navbar from '@/app/components/nav';
import Footer from '@/app/components/footer';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// สร้าง Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // user state เช่น { email, role }
   const pathname = usePathname();
  const isLoginPage = pathname === "/login"; // ตรวจสอบว่าหน้าปัจจุบันคือ /login หรือไม่
  const isregisterPage = pathname === "/register";

  const login = (userData) => {
    setUser(userData);
    // เก็บข้อมูลใน cookie (ในชีวิตจริงควรใช้ token)
    document.cookie = `user=${JSON.stringify(userData)}; path=/`;
  };
  
  const logout = () => {
    setUser(null);
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
         {(!isLoginPage && !isregisterPage) && <Navbar />}
      {children}
      {(!isLoginPage && !isregisterPage)  && <Footer/>}
      </motion.div>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// RootLayoutClient Component
export default function RootLayoutClient({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}