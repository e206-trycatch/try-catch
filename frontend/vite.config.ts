import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // sockjs-client가 Node.js의 global 변수를 참조하므로 브라우저용 호환처리
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 로컬호스트로 백엔드 연결하기 위한 vite proxy 세팅
  // 개발 서버 설정 (npm run dev 시 적용)
  server: {
    // 프록시 설정: 특정 경로 요청을 다른 서버로 전달
    proxy: {
      // '/api'로 시작하는 모든 요청을 백엔드 서버로 전달
      // 예: localhost:5173/api/v1/users → localhost:8081/api/v1/users
      '/api': {
        target: 'https://i14e206.p.ssafy.io/', // 백엔드 서버 주소
        changeOrigin: true, // 요청 헤더의 Host를 target 주소로 변경 (CORS 우회)
        ws: true, // WebSocket 업그레이드 프록시 허용
      },
    },
  },
});
