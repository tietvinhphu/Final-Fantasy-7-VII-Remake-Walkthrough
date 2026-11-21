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
  env: { NEXT_PUBLIC_BASE: BASE },
};
