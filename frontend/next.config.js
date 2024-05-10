/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  webpack: (config, options) => {
    config.externals.push('mapbox-gl');
    return config;
  },
};

module.exports = nextConfig;
