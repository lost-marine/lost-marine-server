import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      // 프록시 대상 서버의 엔드포인트와 옵션을 지정합니다.
      '/socket.io': {
        target: 'http://localhost:3000', // 소켓 서버의 주소
        ws: true, // WebSocket 프록시 지원 여부
        changeOrigin: true, // origin 헤더 변경 여부
      },
    }
  },
  ssr: {
    noExternal: ["typedi"]
  },
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/server.ts",
      exportName: "viteNodeApp",
      initAppOnBoot: true,
      tsCompiler: "esbuild",
      swcOptions: {}
    }),
    tsconfigPaths()
  ],
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: 'tsconfig.json'
    }
  }
});
