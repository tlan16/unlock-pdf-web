import { defineConfig } from "@rsbuild/core";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";
import CompressionPlugin from "compression-webpack-plugin";

export default defineConfig({
	performance: {
		chunkSplit: {
			strategy: "all-in-one",
		},
	},
	resolve: {
		dedupe: [
			"safe-buffer",
			"readable-stream",
			"bn.js",
			"string_decoder",
			"buffer",
		],
	},
	output: {
		assetPrefix: "./",
		// @ts-ignore
		publicPath: "/public/",
		copy: [
			{
				from: "./node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm",
				to: "./",
			},
		],
		cleanDistPath: true,
	},
	tools: {
		rspack: {
			plugins: [
				new CompressionPlugin({
					algorithm: "gzip",
					compressionOptions: { level: 9 },
				}),
			],
		},
	},
	html: {
		title: "PDF Unlocker",
		favicon: "./src/assets/favicon.svg",
		appIcon: {
			name: "My Website",
			icons: [
				{ src: "./src/assets/favicon-192.png", size: 192 },
				{ src: "./src/assets/favicon-512.png", size: 512 },
			],
		},
		meta: {
			description:
				"Unlock your PDF files with ease using our online PDF unlocker tool. Remove password protection and restrictions from your PDF documents quickly and securely.",
		},
	},
	plugins: [pluginNodePolyfill()],
});
