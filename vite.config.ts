import { defineConfig } from 'vite';
import terminal from "vite-plugin-terminal";

export default defineConfig({
  base: './', // 确保路径相对，方便静态访问
  plugins: [
    // terminal({
    //   console: "terminal", // 可选 'terminal'（仅终端）、'console'（仅浏览器）、'both'（两者）
    // }),
  ],
});
