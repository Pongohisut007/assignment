import Navbar from "@/app/components/nav";
import "./globals.css";
import Footer from "./components/footer";
import RootLayoutClient from "./RootLayout.client"; // เรียกใช้ Client Component

export const metadata = {
  title: "My App",
  description: "A Next.js application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        
        <RootLayoutClient>{children}</RootLayoutClient> {/* ใช้ Client Component */}
      </body>
    </html>
  );
}
