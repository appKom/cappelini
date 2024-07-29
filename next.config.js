/** @type {import('next').NextConfig} */
// eslint-disable-next-line no-unused-vars
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  },
  source: "/api/:path*",
  headers: [
    { key: "Access-Control-Allow-Credentials", value: "true" },
    { key: "Access-Control-Allow-Origin", value: "*" },
    {
      key: "Access-Control-Allow-Methods",
      value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    },
    {
      key: "Access-Control-Allow-Headers",
      value:
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  ],
};
