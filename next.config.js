/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'onnxruntime-node': false,
      '@xenova/transformers/src/backends/onnx.js': false,
    }
    return config
  },
}

module.exports = nextConfig
