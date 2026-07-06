/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 게임 소스(src/)는 순수 ES 모듈이며 Next 번들러로 트랜스파일해야 함.
  transpilePackages: ['three'],
};

export default nextConfig;
