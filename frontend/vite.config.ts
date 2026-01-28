import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // 로컬호스트로 백엔드 연결하기 위한 vite proxy 세팅
  // 개발 서버 설정 (npm run dev 시 적용)
  server: {
    // 프록시 설정: 특정 경로 요청을 다른 서버로 전달
    proxy: {
      // '/api'로 시작하는 모든 요청을 백엔드 서버로 전달
      // 예: localhost:5173/api/v1/users → localhost:8081/api/v1/users
      '/api': {
        target: 'http://localhost:8081', // 백엔드 서버 주소
        changeOrigin: true, // 요청 헤더의 Host를 target 주소로 변경 (CORS 우회)
      },
    },
  },
});
