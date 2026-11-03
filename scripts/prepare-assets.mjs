// Reads assets.manifest.json and writes optimised files from Material/ to public/media/
// (docs/BUILD.md section 6). Never touches Material/. Written when the media is prepared.

import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("assets.manifest.json", "utf8"));
console.log(`${manifest.length} assets in the manifest. The pipeline isn't built yet.`);
