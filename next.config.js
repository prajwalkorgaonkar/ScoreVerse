/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Remove hardcoded allowedOrigins — it breaks production deployments
  // Next.js handles CSRF protection automatically for server actions
}

module.exports = nextConfig
