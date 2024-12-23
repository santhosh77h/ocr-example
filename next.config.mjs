const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['tesseract.js'],
		outputFileTracingIncludes: {
			'/api/**/*': ['./node_modules/**/*.wasm', './node_modules/**/*.proto'],
		},
	},
};
