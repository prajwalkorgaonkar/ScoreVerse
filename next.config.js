/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // 🔥 FIX: Prevent jspdf from breaking server build
  experimental: {
    serverComponentsExternalPackages: ["jspdf", "jspdf-autotable"],
  },
};

module.exports = nextConfig;