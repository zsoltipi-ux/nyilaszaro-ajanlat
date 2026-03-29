// build-ghpages.mjs
// Builds the project with base=/nyilaszaro-ajanlat/ for GitHub Pages hosting
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const REPO_NAME = "nyilaszaro-ajanlat";
const DIST = path.resolve("dist/public");

console.log("Building for GitHub Pages...");
execSync(`VITE_BASE=/${REPO_NAME}/ pnpm vite build --base=/${REPO_NAME}/`, {
  stdio: "inherit",
  cwd: process.cwd(),
});

// Copy index.html to 404.html so client-side routing works on GH Pages
const indexHtml = path.join(DIST, "index.html");
const notFoundHtml = path.join(DIST, "404.html");
fs.copyFileSync(indexHtml, notFoundHtml);
console.log("Copied index.html → 404.html for SPA routing");

console.log("Build complete:", DIST);
