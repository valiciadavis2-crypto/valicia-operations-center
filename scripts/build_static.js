const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const requiredFiles = [
  ["index.html", "index.html"],
  ["node_modules/react/umd/react.development.js", "node_modules/react/umd/react.development.js"],
  ["node_modules/react-dom/umd/react-dom.development.js", "node_modules/react-dom/umd/react-dom.development.js"],
  ["node_modules/@babel/standalone/babel.min.js", "node_modules/@babel/standalone/babel.min.js"],
  ["node_modules/@supabase/supabase-js/dist/umd/supabase.js", "node_modules/@supabase/supabase-js/dist/umd/supabase.js"]
];

function copyFile(fromRelative, toRelative) {
  const from = path.join(root, fromRelative);
  const to = path.join(dist, toRelative);
  if (!fs.existsSync(from)) {
    throw new Error(`Missing build input: ${fromRelative}. Run npm install before building.`);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function jsString(value) {
  return JSON.stringify(String(value || ""));
}

function writeEnvFile() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  const contents = `window.VALICIA_ENV = {
  supabase_url: ${jsString(supabaseUrl)},
  supabase_anon_key: ${jsString(supabaseAnonKey)}
};
`;
  fs.writeFileSync(path.join(dist, "env.js"), contents);
}

fs.rmSync(dist, { recursive: true, force: true });
for (const [from, to] of requiredFiles) copyFile(from, to);
fs.cpSync(path.join(root, "src"), path.join(dist, "src"), {
  recursive: true,
  filter: source => {
    const name = path.basename(source).toLowerCase();
    return !name.includes("backup") && name !== ".claude";
  }
});
writeEnvFile();

console.log(`Static Netlify build written to ${dist}`);
