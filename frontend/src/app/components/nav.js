"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";

const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "ChatRoom", href: "/chatRoom", current: false },
  { name: "Forum", href: "/forum", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [usernameInitial, setUsernameInitial] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = getCookie("isLoggedIn");
      const userCookie = getCookie("user");
      console.log("isLoggedIn:", isLoggedIn, "userCookie:", userCookie);

      const isAuth = isLoggedIn === "true";
      setIsAuthenticated(isAuth);

      if (isAuth && userCookie) {
        const userData = JSON.parse(userCookie);
        const username = userData.email.split("@")[0];
        setUsernameInitial(username.charAt(0).toUpperCase());
      } else {
        setUsernameInitial("");
      }
    }; 

    checkAuth();
    setHydrated(true);

    const timeout = setTimeout(checkAuth, 100);

    if (router && router.events) {
      router.events.on("routeChangeComplete", checkAuth);
      return () => {
        clearTimeout(timeout);
        router.events.off("routeChangeComplete", checkAuth);
      };
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = "user=; path=/; max-age=0";
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "isLoggedIn=; path=/; max-age=0";
    setIsAuthenticated(false);
    setUsernameInitial("");
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!hydrated) return null;

  const filteredNavigation = isAuthenticated
    ? navigation
    : navigation.filter((item) => item.name === "Home");

  return (
    <nav className="bg-gray-800 dark:bg-gray-200">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* ฝั่งซ้าย: โลโก้ */}
          <div className="flex shrink-0 items-center">
            <Link href="/">
              <img
                alt="Your Company"
                src="./output.png"
                className="h-16 w-auto cursor-pointer"
              />
            </Link>
            <div className="text-xl font-bold text-fuchsia-600 dark:text-fuchsia-700">
              N e w G e n F o r u m
            </div>
          </div>

          {/* ฝั่งขวา: Navigation และ Sign In/User Menu */}
          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <div className="flex space-x-4">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "text-white hover:bg-gray-700 dark:bg-gray-300 dark:text-black"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-700 dark:hover:bg-gray-400 dark:hover:text-black",
                    "rounded-md px-3 py-2 text-sm font-medium"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Theme Switch Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-700 text-white dark:bg-gray-300 dark:text-black hover:bg-gray-500"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Sign In หรือ User Menu */}
            {isAuthenticated ? (
              <>
                <Menu as="div" className="relative">
                  <MenuButton className="relative flex items-center justify-center rounded-full bg-gray-800 border-2 border-white text-sm text-white dark:bg-gray-300 dark:border-gray-400 hover:bg-gray-700 dark:text-black focus:ring-2 focus:ring-white w-8 h-8">
                    <span className="sr-only">Open user menu</span>
                    <span className="text-lg font-medium">
                      {usernameInitial || "U"}
                    </span>
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-200 rounded-md shadow-lg py-1">
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          href="/profile" // เปลี่ยนจาก "" เป็น URL จริง
                          className={classNames(
                            active ? "bg-gray-100 dark:bg-gray-300" : "",
                            "block px-4 py-2 text-sm text-gray-700 dark:text-gray-800"
                          )}
                        >
                          Your Profile
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          href="/settings" // เปลี่ยนจาก "" เป็น URL จริง
                          className={classNames(
                            active ? "bg-gray-100 dark:bg-gray-300" : "",
                            "block px-4 py-2 text-sm text-gray-700 dark:text-gray-800"
                          )}
                        >
                          Settings
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(
                            active ? "bg-gray-100 dark:bg-gray-300" : "",
                            "block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-800"
                          )}
                        >
                          Logout
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* ปุ่มเมนูสำหรับ mobile */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative p-2 text-gray-400 hover:bg-gray-700 hover:text-white dark:text-gray-600 dark:hover:bg-gray-400 dark:hover:text-black focus:ring-2 focus:ring-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <XMarkIcon className="block size-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block size-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* เมนู mobile */}
      {menuOpen && (
        <div className="sm:hidden px-2 pt-2 pb-3">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? "bg-gray-900 text-white dark:bg-gray-300 dark:text-black"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-700 dark:hover:bg-gray-400 dark:hover:text-black",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-700 dark:hover:bg-gray-400 dark:hover:text-black"
          >
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-700 dark:hover:bg-gray-400 dark:hover:text-black"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white dark:text-gray-700 dark:hover:bg-gray-400 dark:hover:text-black"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}