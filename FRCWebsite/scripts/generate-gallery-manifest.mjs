/**
 * Reads dimensions from image headers only (no full decode).
 * Run before `tsc` / `vite build` so the gallery never downloads every full image
 * in the browser just to measure layout — that is what makes production painfully slow.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sizeOf from "image-size";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const galleryDir = path.join(root, "src", "assets", "gallery");
const outFile = path.join(root, "src", "generated", "gallery-manifest.json");

function main() {
    if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, JSON.stringify({ images: [] }, null, 2) + "\n", "utf8");
        console.warn(`[gallery-manifest] No folder at ${galleryDir}; wrote empty manifest.`);
        return;
    }

    const files = fs
        .readdirSync(galleryDir)
        .filter((f) => /\.(jpe?g|png)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const images = [];
    for (const file of files) {
        const fp = path.join(galleryDir, file);
        const buffer = fs.readFileSync(fp);
        const dim = sizeOf(buffer);
        if (!dim.width || !dim.height) {
            console.warn(`[gallery-manifest] Could not read dimensions for ${file}, skipping.`);
            continue;
        }
        images.push({ file, width: dim.width, height: dim.height });
    }

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify({ images }, null, 2) + "\n", "utf8");
    console.log(`[gallery-manifest] Wrote ${images.length} entries to src/generated/gallery-manifest.json`);
}

main();
