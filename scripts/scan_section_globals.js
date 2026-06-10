// One-off check: find identifiers referenced in a section file that are not
// defined in the section itself, opportunity-intake.jsx, app.jsx, or index.html.
const fs = require("fs");
const path = require("path");
const Babel = require("@babel/standalone");

const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

function parseProgram(code, label) {
  let globals = null;
  let bindings = null;
  try {
    Babel.transform(code, {
      presets: [["react", { runtime: "classic" }]],
      filename: label,
      plugins: [
        function collectScope() {
          return {
            visitor: {
              Program(p) {
                globals = Object.keys(p.scope.globals);
                bindings = Object.keys(p.scope.bindings);
              }
            }
          };
        }
      ]
    });
  } catch (e) {
    console.error(`PARSE/COMPILE ERROR in ${label}:`, e.message);
    process.exit(1);
  }
  return { globals, bindings };
}

const targetPath = process.argv[2] || "src/sections/government.jsx";
const targetName = path.basename(targetPath);
const target = parseProgram(read(targetPath), targetName);
console.log(`${targetName} compiled OK`);

const intake = parseProgram(read("src/utils/opportunity-intake.jsx"), "opportunity-intake.jsx");
const app = parseProgram(read("src/app.jsx"), "app.jsx");

// Globals provided by the browser/runtime or index.html
const env = new Set([
  "React", "ReactDOM", "window", "document", "console", "fetch", "localStorage",
  "sessionStorage", "navigator", "alert", "confirm", "prompt", "setTimeout",
  "setInterval", "clearTimeout", "clearInterval", "JSON", "Math", "Date",
  "Object", "Array", "String", "Number", "Boolean", "Promise", "Set", "Map",
  "RegExp", "Error", "TypeError", "isNaN", "parseFloat", "parseInt", "NaN",
  "Infinity", "undefined", "encodeURIComponent", "decodeURIComponent",
  "URLSearchParams", "URL", "Blob", "FileReader", "FormData", "AbortController",
  "crypto", "structuredClone", "Intl", "atob", "btoa", "location", "history",
  "CustomEvent", "Event", "requestAnimationFrame", "cancelAnimationFrame",
  "supabase", "Babel"
]);

const provided = new Set([...intake.bindings, ...app.bindings]);

// Also treat globals assigned on window in index.html as provided
const indexHtml = read("index.html");
for (const m of indexHtml.matchAll(/window\.(\w+)\s*=/g)) provided.add(m[1]);
for (const m of indexHtml.matchAll(/(?:const|let|var|function)\s+(\w+)/g)) provided.add(m[1]);

const missing = target.globals.filter(g => !env.has(g) && !provided.has(g));
console.log(`\nUnresolved identifiers in ${targetName}:`);
console.log(missing.length ? missing.join("\n") : "(none)");

// Same check for opportunity-intake.jsx (bundled with government.jsx)
const provided2 = new Set([...target.bindings, ...app.bindings]);
for (const m of indexHtml.matchAll(/window\.(\w+)\s*=/g)) provided2.add(m[1]);
for (const m of indexHtml.matchAll(/(?:const|let|var|function)\s+(\w+)/g)) provided2.add(m[1]);
const missing2 = intake.globals.filter(g => !env.has(g) && !provided2.has(g));
console.log("\nUnresolved identifiers in opportunity-intake.jsx:");
console.log(missing2.length ? missing2.join("\n") : "(none)");
