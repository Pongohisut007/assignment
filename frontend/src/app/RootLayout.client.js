"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Navbar from "./components/nav";
import Footer from "./components/footer";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login"; // ตรวจสอบว่าหน้าปัจจุบันคือ /login หรือไม่

  return (
    
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
         {!isLoginPage && <Navbar />}
        <main>{children}</main>
        {!isLoginPage && <Footer/>}
      </motion.div>
  );
}
