const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const extensionRoot = __dirname;
const repoRoot = path.resolve(extensionRoot, "../..");
const stagingRoot = path.join(repoRoot, ".vsix-staging");

fs.rmSync(stagingRoot, { recursive: true, force: true });
fs.mkdirSync(stagingRoot, { recursive: true });

const filesToCopy = ["dist", "webview", "README.md", "icon.png", "LICENSE", "package.json"];

for (const item of filesToCopy) {
  const source = path.join(extensionRoot, item);
  const destination = path.join(stagingRoot, item);

  if (fs.existsSync(source)) {
    fs.cpSync(source, destination, { recursive: true });
  }
}

console.log("Staging extension files...");
console.log(`Staging directory: ${stagingRoot}`);

execFileSync("cmd.exe", ["/c", "npx.cmd", "vsce", "package", "--no-dependencies"], {
  cwd: stagingRoot,
  stdio: "inherit",
});

console.log("VSIX packaging completed.");
