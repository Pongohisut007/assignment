'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', current: true },
  { name: 'Translation', href: '/Translation', current: false },
  { name: 'Projects', href: '/projects', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [usernameInitial, setUsernameInitial] = useState(''); // ตัวอักษรแรกของ username
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = getCookie('isLoggedIn');
      const userCookie = getCookie('user');
      console.log('isLoggedIn:', isLoggedIn, 'userCookie:', userCookie);
      
      const isAuth = isLoggedIn === 'true';
      setIsAuthenticated(isAuth);

      if (isAuth && userCookie) {
        const userData = JSON.parse(userCookie);
        const username = userData.email.split('@')[0]; // สมมติว่าไม่มี username ใน cookie ใช้ email แทน
        setUsernameInitial(username.charAt(0).toUpperCase()); // ตัวอักษรแรก
      } else {
        setUsernameInitial('');
      }
    };

    checkAuth();
    setHydrated(true);

    const timeout = setTimeout(checkAuth, 100); // Retry หลัง 100ms เพื่อ sync cookie

    if (router && router.events) {
      router.events.on('routeChangeComplete', checkAuth);
      return () => {
        clearTimeout(timeout);
        router.events.off('routeChangeComplete', checkAuth);
      };
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'user=; path=/; max-age=0';
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'isLoggedIn=; path=/; max-age=0';
    setIsAuthenticated(false);
    setUsernameInitial(''); // รีเซ็ตตัวอักษรแรก
    router.push('/login');
  };

  if (!hydrated) return null;

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <XMarkIcon className="block size-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block size-6" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link href="/">
                <img
                  alt="Your Company"
                  src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-8 w-auto cursor-pointer"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} legacyBehavior>
                    <a
                      className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {isAuthenticated ? (
              <>
                <button className="relative p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:outline-none">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="size-6" aria-hidden="true" />
                </button>
                <Menu as="div" className="relative ml-3">
                  <MenuButton className="relative flex items-center justify-center rounded-full bg-gray-800 border-2 border-white text-sm text-white focus:ring-2 focus:ring-white w-8 h-8">
                    <span className="sr-only">Open user menu</span>
                    <span className="text-lg font-medium ">
                      {usernameInitial || 'U'} {/* แสดงตัวอักษรแรก หรือ 'U' ถ้าไม่มี */}
                    </span>
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <MenuItem>
                      {({ active }) => (
                        <Link href="/profile" legacyBehavior>
                          <a className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
                            Your Profile
                          </a>
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link href="/settings" legacyBehavior>
                          <a className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
                            Settings
                          </a>
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}
                        >
                          Logout
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <Link href="/login" legacyBehavior>
                <a className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  Sign In
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} legacyBehavior>
              <a
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium'
                )}
              >
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}