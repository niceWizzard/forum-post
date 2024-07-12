import MillionLint from '@million/lint';
await import("./src/env/client.mjs");
await import("./src/env/server.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {};
export default MillionLint.next({
  rsc: true
})(nextConfig);