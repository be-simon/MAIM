/** @type {import('next').NextConfig} */
const nextConfig = {
  // pages 디렉토리 사용
  useFileSystemPublicRoutes: true,
  
  // 실험적 기능 비활성화
  experimental: {
    appDir: false
  }
}

module.exports = nextConfig 