/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, options) => {
    config.externals.push('mapbox-gl');
    return config;
  },
};

module.exports = nextConfig;
