const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, "dist-static");

const FILES_TO_COPY = [
  "index.html",
  "index-en.html",
  "styles.css",
  "app.js",
  "runtime-config.js",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "social-preview.png",
  "social-preview.svg"
];

const DIRECTORIES_TO_COPY = [
  "assets",
  path.join("data", "bootstrap-data.json")
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDistDir() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  ensureDir(DIST_DIR);
}

function copyFile(relativePath) {
  const sourcePath = path.join(ROOT, relativePath);
  const targetPath = path.join(DIST_DIR, relativePath);

  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function copyDirectory(relativePath) {
  const sourcePath = path.join(ROOT, relativePath);
  const targetPath = path.join(DIST_DIR, relativePath);

  ensureDir(path.dirname(targetPath));
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

function main() {
  resetDistDir();

  FILES_TO_COPY.forEach(copyFile);
  DIRECTORIES_TO_COPY.forEach((relativePath) => {
    const fullPath = path.join(ROOT, relativePath);
    if (fs.statSync(fullPath).isDirectory()) {
      copyDirectory(relativePath);
      return;
    }
    copyFile(relativePath);
  });

  console.log(`Static site generated at ${DIST_DIR}`);
}

main();
