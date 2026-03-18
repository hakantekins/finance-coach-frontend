/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16: `reactCompiler` moved out of `experimental`
  // Keeping it explicitly disabled avoids hydration-related noise in some UI libs.
  reactCompiler: false,
}

export default nextConfig