import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col sm:flex-row gap-8 row-start-2 items-center justify-between w-full max-w-5xl">
        {/* ส่วนซ้าย: ข้อความ */}
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Small AI
          </h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-md">
            การผสานระหว่าง IoT และ Website โดยใช้ไมค์ในการเปลี่ยนภาษาและส่งออกข้อมูลแบบ Real-time บนหน้าจอแสดงผล
          </p>
          <div className="flex gap-4 items-center justify-center sm:justify-start flex-col sm:flex-row">
            <Link href="/Translation" legacyBehavior>
              <a className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                <Image
                  className="dark:invert"
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

        {/* ส่วนขวา: รูปไมค์ */}
        <div className="flex-shrink-0 sm:ml-auto">
          <Image
            src="/TranslationPig.jpg" // เปลี่ยนเป็น path ของรูปไมค์ที่คุณมี
            alt="Microphone illustration"
            width={600}
            height={900}
            priority
            className="dark:invert"
          />
        </div>
      </main>
    </div>
  );
}