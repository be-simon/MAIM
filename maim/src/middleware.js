import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;

      // 디버깅을 위한 로그
      console.log('Current path:', pathname);
      console.log('Token exists:', !!token);

      // auth 페이지 처리
      if (pathname.startsWith('/auth')) {
        if (token) {
          // 로그인된 상태에서 auth 페이지 접근 시 홈으로
          return NextResponse.redirect(new URL('/', req.url));
        }
        return true;
      }

      // 보호된 경로 처리
      if (pathname === '/' || 
          pathname.startsWith('/chat') || 
          pathname.startsWith('/summary') ||
          pathname.startsWith('/history')) {
        return !!token;
      }

      return true;
    },
  },
});

export const config = {
  matcher: [
    '/',
    '/chat/:path*',
    '/summary/:path*',
    '/history/:path*',
    '/auth/:path*'
  ],
}; 