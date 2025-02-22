const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add GLB to asset extensions
config.resolver.assetExts.push("glb");

// Configure asset resolver
config.resolver.extraNodeModules = {
	assets: path.resolve(__dirname, "./assets"),
};

module.exports = config;
