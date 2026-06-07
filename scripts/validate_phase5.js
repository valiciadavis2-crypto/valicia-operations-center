const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const checks = [
  ["src/app.jsx", "const exportBackup"],
  ["src/app.jsx", "aria-current"],
  ["src/app.jsx", "Skip to content"],
  ["src/app.jsx", "record updated"],
  ["src/app.jsx", "record deleted"],
  ["src/styles.css", ".skip-link"],
  ["src/styles.css", ":focus-visible"],
  ["supabase/migrations/001_initial_schema.sql", "enable row level security"],
  ["docs/DEPLOYMENT.md", "Deployment Guide"],
  ["docs/BACKUP_AND_RECOVERY.md", "Backup And Recovery"],
  ["docs/QA_CHECKLIST.md", "QA Checklist"]
];

let failed = false;
for (const [file, marker] of checks) {
  const fullPath = path.join(root, file);
  const text = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
  if (!text.includes(marker)) {
    failed = true;
    console.error(`Missing marker "${marker}" in ${file}`);
  }
}

if (failed) process.exit(1);
console.log("Phase 5 validation markers passed.");
