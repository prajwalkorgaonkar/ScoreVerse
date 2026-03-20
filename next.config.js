/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // ✅ UPDATED (Next.js 16 correct key)
  serverExternalPackages: ["jspdf", "jspdf-autotable"],
};

module.exports = nextConfig;