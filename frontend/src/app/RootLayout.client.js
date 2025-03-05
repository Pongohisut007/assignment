'use client';

import { createContext, useContext, useState } from 'react';
import Navbar from '@/app/components/nav';
import Footer from '@/app/components/footer';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// สร้าง Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  const isAssistantPage = pathname === "/Assistant";
  const isForum = pathname === "/forum"
  

  const login = (userData) => {
    setUser(userData);
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
        {(!isLoginPage && !isRegisterPage ) && <Navbar />}
        {children}
        {(!isLoginPage && !isRegisterPage && !isAssistantPage &&!isForum) && <Footer />}
      </motion.div>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// RootLayoutClient Component
export default function RootLayoutClient({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}