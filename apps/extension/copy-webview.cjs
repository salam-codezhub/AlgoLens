const fs = require("fs");
const path = require("path");

const extensionRoot = __dirname;
const source = path.resolve(extensionRoot, "../webview/dist");
const destination = path.resolve(extensionRoot, "webview");

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });

console.log(`AlgoLens webview copied successfully: ${source} -> ${destination}`);
