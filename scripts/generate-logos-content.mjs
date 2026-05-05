import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");
const logosDir = path.join(workspaceRoot, "contents", "resources", "logos");
const outputFile = path.join(workspaceRoot, "contents", "logos-content.js");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif"]);

function toDisplayName(filename) {
  const basename = path.parse(filename).name;

  return basename
    .replace(/[_-]+/g, " ")
    .replace(/\bsvg\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildLogoRecord(filename) {
  return {
    src: `./contents/resources/logos/${filename}`,
    alt: `${toDisplayName(filename)} logo`,
  };
}

function buildOutput(logos) {
  return `window.SITE_CONTENT = {
  ...(window.SITE_CONTENT || {}),
  logos: ${JSON.stringify(logos, null, 2)},
};
`;
}

async function main() {
  const entries = await fs.readdir(logosDir, { withFileTypes: true });
  const logos = entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
    .map(buildLogoRecord);

  await fs.writeFile(outputFile, buildOutput(logos), "utf8");
  console.log(`Generated ${path.relative(workspaceRoot, outputFile)} with ${logos.length} logos.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
