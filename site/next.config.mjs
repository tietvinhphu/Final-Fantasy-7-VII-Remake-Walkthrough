// Xuất tĩnh (HTML + JS nhỏ), phát hành bằng GitHub Pages từ gốc repo.
const BASE = "/Final-Fantasy-7-VII-Remake-Walkthrough";

/** @type {import('next').NextConfig} */
export default {
  output: "export",
  basePath: BASE,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  // Mã build cố định: bản dựng giống hệt nhau giữa các lần/máy, git không có thay đổi vô nghĩa.
  generateBuildId: async () => "static",
  env: { NEXT_PUBLIC_BASE: BASE },
};
