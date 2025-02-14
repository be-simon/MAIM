import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // 로그인 페이지는 항상 접근 가능
      if (req.nextUrl.pathname.startsWith('/auth')) {
        return true;
      }
      
      // 모든 보호된 경로는 토큰 필요 (홈페이지 포함)
      if (req.nextUrl.pathname === '/' || 
          req.nextUrl.pathname.startsWith('/chat') || 
          req.nextUrl.pathname.startsWith('/summary') ||
          req.nextUrl.pathname.startsWith('/history')) {
        return !!token;
      }
      
      // 기본적으로 접근 허용
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