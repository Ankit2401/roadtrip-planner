// merge-project.js
const fs = require("fs");
const path = require("path");

const outputFile = "merged-project.txt"; // Final merged file
const rootDir = process.cwd();           // Current working folder

// Files / folders to exclude
const exclude = [
  "node_modules",
  ".git",
  ".env",
  "dist",
  "build",
  "coverage",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "merged-project.txt"
];

// Allowed code file extensions
const allowedExts = [".js", ".ts", ".jsx", ".tsx", ".json", ".html", ".css", ".md"];

// Recursive function to walk and collect files
function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (exclude.includes(file)) {
      continue;
    }

    if (stat.isDirectory()) {
      walkDir(fullPath, fileList);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (allowedExts.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

// Merge files into one
function mergeFiles(files) {
  let mergedContent = "";

  files.forEach(file => {
    const relPath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, "utf-8");
    mergedContent += `\n\n/* ========= File: ${relPath} ========= */\n\n${content}\n`;
  });

  fs.writeFileSync(outputFile, mergedContent, "utf-8");
  console.log(`✅ Project merged into ${outputFile}`);
}

// Run script
const allFiles = walkDir(rootDir);
mergeFiles(allFiles);