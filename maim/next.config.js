/** @type {import('next').NextConfig} */
const nextConfig = {
  // pages 디렉토리 사용
  useFileSystemPublicRoutes: true,
  
  // 실험적 기능 비활성화
  experimental: {
    appDir: false
  },
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // Google 프로필 이미지를 위한 도메인 허용
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
}

module.exports = nextConfig 