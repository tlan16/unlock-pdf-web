import { defineConfig } from '@rsbuild/core';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import CompressionPlugin from "compression-webpack-plugin";

export default defineConfig({
  performance: {
    chunkSplit: {
      strategy: 'split-by-module',
    },
  },
  output: {
    // @ts-ignore
    publicPath: '/public/',
    copy: [
      { from: './public' },
    ],
    cleanDistPath: true,
  },
  tools: {
    rspack: {
      plugins: [new CompressionPlugin({
        algorithm: "gzip",
        compressionOptions: { level: 9 },
      })]
    },
  },
  plugins: [pluginNodePolyfill()],
});
