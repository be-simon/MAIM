export { default } from "next-auth/middleware";

// 모든 인증 관련 코드 제거
export const config = {
  matcher: [] // 인증이 필요한 경로 제거
}; 