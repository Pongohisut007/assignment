// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const userCookie = request.cookies.get('user')?.value;
  const tokenCookie = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  const roleAccess = {
    '/dashboard': ['admin', 'user'],
    '/login': ['guest'],
    '/translation': ['admin', 'user'],
    '/': ['guest', 'admin', 'user'],
  };

  // ถ้าไม่มี token และไม่ใช่หน้า login หรือ root
  if (!tokenCookie && path !== '/login' && path !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let userRole = 'guest';
  let userData = userCookie ? JSON.parse(userCookie) : null;

  // ถ้ามี token ให้ verify กับ backend
  if (tokenCookie) {
    try {
      const response = await fetch('http://localhost:9001/users/me', {
        headers: {
          Authorization: `Bearer ${tokenCookie}`,
        },
      });
      if (!response.ok) {
        // ถ้า token ไม่ถูกต้อง (401) หรือ error อื่น
        const res = NextResponse.redirect(new URL('/login', request.url));
        res.cookies.delete('user'); // ล้าง cookie
        res.cookies.delete('token');
        return res;
      }
      const data = await response.json();
      userRole = data.role;
      userData = { email: data.email, role: data.role };

      // อัปเดต cookie ถ้าข้อมูลเก่าไม่ตรง
      if (!userCookie || userData.role !== data.role) {
        const responseWithCookie = NextResponse.next();
        responseWithCookie.cookies.set('user', JSON.stringify(userData), { path: '/', maxAge: 3600 });
        return responseWithCookie;
      }
    } catch (error) {
      // ถ้า fetch ล้มเหลว (เช่น backend ล่ม)
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('user');
      res.cookies.delete('token');
      return res;
    }
  }

  // ตรวจสอบ role กับ path
  if (roleAccess[path] && !roleAccess[path].includes(userRole)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/login', '/translation', '/'],
};