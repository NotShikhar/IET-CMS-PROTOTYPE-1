/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ietdavv.edu.in' },
    ],
  },
}

export default nextConfig
