import { defineConfig } from '@rsbuild/core';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import CompressionPlugin from "compression-webpack-plugin";

export default defineConfig({
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  output: {
    assetPrefix: './',
    // @ts-ignore
    publicPath: '/public/',
    copy: [
      { from: './node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm', to: './' }
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
